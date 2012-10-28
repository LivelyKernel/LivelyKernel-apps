module('apps.benchmark').requires('lively.morphic').toRun(function() {

Helper = {
    runAndReport: function() {
        var categories = Properties.own(Benchmarks),
            progressBarForCategories = $morph('CategoryProgressBar'),
            progressBar = $morph('BenchmarkProgressBar'),
            text = $morph('Results'),
            heading = "-= " + new Date().format("yyyy-mm-dd HH:mm:ss") + ' =-\n'
                    + Global.navigator.userAgent + " on " + Global.navigator.platform + '\n',
            resultTable = [];
        categories.doAndContinue(
            function(next, categoryName, i) {
                progressBarForCategories.setValue(i / categories.length);
                progressBarForCategories.setLabel(categoryName);
                resultTable.pushAll([[], [categoryName, 'name', 'ops/s', 'ms']]);
                var benchmark = Benchmarks[categoryName],
                    benchmarkNames = Functions.own(benchmark);
                benchmarkNames.forEachShowingProgress(progressBar, function(name) {
                    resultTable.push([
                        '',
                        name,
                        Helper.runBenchmarkThroughput(benchmark, name, 100)*10,
                        Helper.runBenchmarkTimed(benchmark, name)]);

                }, Functions.K, function() { next() });
        }, function() {
            progressBarForCategories.setValue(1);
            progressBarForCategories.setLabel('all done');
            progressBar.setLabel('all done');
            text.textString = heading
                            + Strings.printTable(
                                resultTable, {align: 'left', separator: '   '})
                            + '\n\n' + text.textString;
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
            benchmark = benchmark[name];
        while (duration > (Date.now() - time)) {
            ops++; benchmark();
        }
        return ops;
    },

    runBenchmarkTimed: function(benchmark, name) {
        var benchmark = benchmark[name];
        return Functions.timeToRunN(benchmark, 100);
    }
}

var arr = Helper.createRandomArray(10000);

Benchmarks = {
    // performance of basic array methods:
    "Array - basic": {
        "for": function() {
            var result = 0;
            for (var i = 0; i < arr.length; i++) {
                result += arr[i];
            }
            return result;
        },
        "for - static": function() {
            var result = 0;
            for (var i = 0, len = arr.length; i < len; i++) {
                result += arr[i];
            }
            return result;
        },
        "each": function() {
            var result = 0;
            arr.each(function(n) { result += n });
            return result;
        },
        "forEach": function() {
            var result = 0;
            arr.forEach(function(n, i) { result += n + i });
            return result;
        },
        "all": function() {
            return arr.all(function(n) { return n < 101; });
        },
        "any": function() {
            return arr.any(function(n) { return n > 101; });
        },
        "detect": function() {
            return arr.detect(function(n, i) { return i > arr.length; });
        },
        "collect": function() {
            return arr.collect(function(n, i) { return n.toString(); });
        },
        "map": function() {
            return arr.map(function(n, i) { return n.toString(); });
        },
        "include": function() {
            return arr.include(101);
        },
        "invoke": function() {
            return arr.invoke('toString');
        },
        "groupBy": function() {
            return arr.groupBy(function(n) { return n });
        }
    },

    // comparing different methods to do collect:
    "Array - collect": {
        "for": function() {
            var arr = new Array(100000);
            for (var i = 0, len = arr.length; i < len; i++) {
                arr[i] = Numbers.random(0, 100);
            }
            return arr;
        },
        "forEach": function() {
            var arr = new Array(10000);
            arr.forEach(function(_, i) {
                arr[i] = Numbers.random(0, 100);
            });
            return arr;
        },
        "collect": function() {
            return new Array(10000).collect(function() {
                return Numbers.random(0, 100);
            });
        },
        "invoke": function() {
            return arr.invoke('randomSmallerInteger');
        }
    }
}

}); // end of module