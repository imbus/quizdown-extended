export function shuffle(array: Array<any>, n: number | undefined): Array<any> {
    // Copy the array to avoid mutating the original
    let arr = [...array];
    let currentIndex = arr.length,
        temporaryValue,
        randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }
    return arr.slice(0, n);
}