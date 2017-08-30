var ClosestFibonacci = function(num) {
    if (num <= 1) return 1;

    var Fibonachi = [1, 1];

    while (true) {
        var index = Fibonachi.length;
        Fibonachi.push(Fibonachi[index - 1] + Fibonachi[index - 2]);
        if (Fibonachi[Fibonachi.length - 1] > num) break;
    }

    if ((num - Fibonachi[Fibonachi.length - 2]) > (Fibonachi[Fibonachi.length - 1] - num))
        return next;

    return previous;
}