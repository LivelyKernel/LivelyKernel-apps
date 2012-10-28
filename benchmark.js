module('apps.benchmark').requires('lively.morphic').toRun(function() {

apps.benchmark.Helper = {

    runAndReport: function(benchmarkSpec) {
        // benchmark spec should be an object like
        // {
        //     category1: {
        //         benchFunc1: function() { ... },
        //                                       ...
        //     },
        //     category2: {
        //         benchFunc2: function() { ... }
        //     }
        // }

        var categories = Properties.own(benchmarkSpec),
            progressBarForCategories = $world.addStatusProgress(''),
            progressBar = $world.addStatusProgress(''),
            text = $morph('Results'),
            heading = "-= " + new Date().format("yyyy-mm-dd HH:mm:ss") + ' =-\n'
                    + Global.navigator.userAgent + " on " + Global.navigator.platform + '\n',
            resultTable = [];
        categories.doAndContinue(
            function(next, categoryName, i) {
                progressBarForCategories.setValue(i / categories.length);
                progressBarForCategories.setLabel(categoryName);
                resultTable.pushAll([[], [categoryName, 'name', 'ops/s', 'ms']]);
                var benchmark = benchmarkSpec[categoryName],
                    benchmarkNames = Functions.own(benchmark);
                benchmarkNames.forEachShowingProgress(progressBar, function(name) {
                    resultTable.push([
                        '',
                        name,
                        apps.benchmark.Helper.runBenchmarkThroughput(benchmark, name, 100)*10,
                        apps.benchmark.Helper.runBenchmarkTimed(benchmark, name)]);

                }, Functions.K, function() { next() });
            }, function() {
                progressBarForCategories.remove();
                progressBar.remove();
                var resultString = heading
                                 + Strings.printTable(
                                     resultTable, {align: 'left', separator: '   '})
                                 + '\n\n' + text.textString;
                if (text) text.textString = resultString;
                console.log(resultString);
            });
    },

    createRandomArray: function(n) {
        var arr = new Array(n);
        for (var i = 0; i < n; i++) {
            arr[i] = Numbers.random(0, 100);
        }
        return arr;
    },

    runBenchmarkThroughput: function(benchmark, name, duration) {
        var time = Date.now(),
            ops = 0,
            benchmarkFunc = benchmark[name];
        while ((Date.now() - time) < duration) {
            ops++; benchmarkFunc();
        }
        return ops;
    },

    runBenchmarkTimed: function(benchmark, name) {
        // time for 100 repeats but when it takes longer than maxDuration
        // interpolate
        var benchmarkFunc = benchmark[name],
            maxRepeats = 100,
            maxDuration = 2000,
            startTime = Date.now(),
            recordedTimes = [];
        while (recordedTimes.length < maxRepeats && (Date.now() - startTime) < maxDuration) {
            recordedTimes.push(Functions.timeToRun(benchmarkFunc));
        }
        // it took to long, interpolate value for 100 repeats
        if (recordedTimes.length < maxRepeats) {
            return Numbers.median(recordedTimes) * 100;
        }
        return recordedTimes.sum();
    }

}

}); // end of module