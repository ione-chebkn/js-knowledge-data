const calcBtn = document.getElementById("calcBtn")

calcBtn.addEventListener("click", () => {
    const val1 = document.getElementById("input1").value
    const val2 = document.getElementById("input2").value
    const operation = document.getElementById("operation").value
    if (val1 && val2 && operation) {
        const resultDom = document.getElementById("result")
        resultDom.innerHTML = eval(`${val1} ${operation} ${val2}`)
    }
})
