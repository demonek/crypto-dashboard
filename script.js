const cryptoRates = document.querySelector('.currency-price-panel')
const ctx = document.getElementById('chart').getContext('2d');
const chartCurrency = document.querySelector('.chart-currency')
const chartTimeFilters = document.querySelector('.chart-time-filters')
const basisCurrency = document.getElementById('basis-currency')
const finalCurrency = document.getElementById('final-currency')
const amountInput = document.getElementById('amount-input')
const convertBtn = document.querySelector('.convert-btn') 
const convertOutput = document.querySelector('.convert-output')
const reverseBtn = document.querySelector('.reverse-btn')
const news = document.querySelector('.news')

const availableCrypto = [
    { id: 'BTC'},
    { id: 'ETH'},
    { id: 'BNB'},
    { id: 'USDT'},
    { id: 'SOL'},
    { id: 'ADA'},
    { id: 'LTC'}
]

const labelsOptions = [
    {
        id: '24h',
        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    },
    {
        id: '7d',
        labels: ['', '', '', '', '', '', '']
    },
    {
        id: '30d',
        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',]
    },
    {
        id: '1y',
        labels: ['', '', '', '', '', '', '', '', '', '', '', '']
    },
    {
        id: '5y',
        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', '', '', '']
    }
]


finalCurrency.innerHTML += `<option value="usd">USD - US Dollar</option>`

let labels = labelsOptions[0].labels

let myChart
let currentUuid = 'Qwsogvtv82FCd'
let timeFilter = '24h'

function convert() {
    let input = amountInput.value
    if (!isNaN(input) && input) {
        if (basisCurrency.value != 'usd' && finalCurrency.value == 'usd') {
            let price = parseFloat(availableCrypto.find(crypto => crypto.id.toLowerCase() == basisCurrency.value).price)
            convertOutput.innerHTML = `${price * input} - US Dollar` 
        } else if (basisCurrency.value == 'usd' && finalCurrency.value != 'usd') {
            let currency = availableCrypto.find(crypto => crypto.id.toLowerCase() == finalCurrency.value)
            let price = parseFloat(currency.price)
            convertOutput.innerHTML = `${input / price} - ${currency.name}` 
        } else if (basisCurrency.value == finalCurrency.value) {
            let cryptoName = availableCrypto.find(crypto => crypto.id.toLowerCase() == basisCurrency.value).name
            convertOutput.innerHTML = `${input} - ${cryptoName}`
        } else {
            let finalCurrencyName = availableCrypto.find(crypto => crypto.id.toLowerCase() == finalCurrency.value).name
            let basisPrice = parseFloat(availableCrypto.find(crypto => crypto.id.toLowerCase() == basisCurrency.value).price)
            let finalPrice = parseFloat(availableCrypto.find(crypto => crypto.id.toLowerCase() == finalCurrency.value).price)
            convertOutput.innerHTML = `${basisPrice / finalPrice} - ${finalCurrencyName}`
        }
    } else {
        convertOutput.innerHTML = `<span class="red">Wrong value</span>`
    }
    
}

function createChart(coinHistory) {
    myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'BTC',
            data: coinHistory,
            backgroundColor: [
                'black'
            ],
            borderColor: [
                'black'
            ],
            borderWidth: 1,
        }]
    },options: {
        plugins: {
          legend: {
            display: false
          }
        }
        },
        maintainAspectRatio: false,
    });
}


async function getChartData() {
    const response = await fetch(`https://coinranking1.p.rapidapi.com/coin/${currentUuid}/history?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=${timeFilter}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coinranking1.p.rapidapi.com",
            "x-rapidapi-key": api_key.split('$$')[0]
        }
    })
    const data = await response.json()
    let onlyNumbers = []
    for (let i = 0; i < data.data.history.length; i++){
        onlyNumbers.push(data.data.history[i].price)
    }
    onlyNumbers = onlyNumbers.filter(Boolean)
    let coinHistory = []
    let historyEntries = onlyNumbers.length / labels.length
    for (let i = 0; i < onlyNumbers.length; i += historyEntries) { 
        coinHistory.push(onlyNumbers[Math.floor(i)])
    }
    coinHistory = coinHistory.reverse()
    createChart(coinHistory)
}

async function getRatesData() { 
    const response = await fetch("https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=3h&tiers=1&orderBy=marketCap&orderDirection=desc&limit=50&offset=0", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "coinranking1.p.rapidapi.com",
            "x-rapidapi-key": api_key.split('$$')[0]
        }
    })
    const data = await response.json()
    for (availableCoin of availableCrypto) {
        for (coin of data.data.coins) {
            if (availableCoin.id == coin.symbol) {
                let price = parseFloat(coin.price).toFixed(4)
                let change = coin.change
                availableCoin.name = coin.name
                availableCoin.url = coin.iconUrl
                availableCoin.uuid = coin.uuid
                availableCoin.price = coin.price
                if (change.charAt(0) == "-") {
                    cryptoRates.innerHTML += `<div class="currency-row"> <img src="${coin.iconUrl}" alt="">
                    <span>${coin.symbol}</span>
                    <span class="red">▼${price}$</span>
                    <div class="tooltip"><button class="btn-generate-chart" data-currency="${coin.symbol}"></button><span class="tooltiptext">Generate chart</span></div></div>`
                } else {
                    cryptoRates.innerHTML += `<div class="currency-row"> <img src="${coin.iconUrl}" alt="">
                    <span>${coin.symbol}</span>
                    <span class="green">▲${price}$</span>
                    <div class="tooltip"><button class="btn-generate-chart" data-currency="${coin.symbol}"></button><span class="tooltiptext">Generate chart</span></div></div>`
                }
                basisCurrency.innerHTML += `<option value="${coin.symbol.toLowerCase()}">${coin.symbol} - ${coin.name}</option>`
                finalCurrency.innerHTML += `<option value="${coin.symbol.toLowerCase()}">${coin.symbol} - ${coin.name}</option>`
            }
        }
    }
    basisCurrency.innerHTML += `<option value="usd">USD - US Dollar</option>`
    const generateChartBtns = document.querySelectorAll('.btn-generate-chart')
    generateChartBtns[0].classList.add('active')
    generateChartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            for (btn of generateChartBtns) {
                btn.classList.remove('active')
            }
            e.target.classList.add('active')
            let selectedCurrency = e.target.dataset.currency
            let temp= availableCrypto.find(crypto => crypto.id == selectedCurrency)
            currentUuid = temp.uuid
            myChart.destroy()
            getChartData()
            chartCurrency.innerHTML = `<sup><img src="${temp.url}" alt=""></sup>${temp.name}`
        })
    })

}


async function getNews() {
    const response = await fetch("https://crypto-news-live3.p.rapidapi.com/news", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "crypto-news-live3.p.rapidapi.com",
            "x-rapidapi-key": api_key.split('$$')[0]
        }
    })
    const data = await response.json()
    for (let i = 0; i < 5; i++){
        let randomNews = Math.floor(Math.random() * data.length)
        news.innerHTML += `<p><a href=${data[randomNews].url} target="_blank">${data[randomNews].title.trim()} </a></p>`
    }
}

chartTimeFilters.addEventListener('click', (e) => {
    if (e.target.tagName == 'BUTTON') { 
        timeFilter = e.target.innerHTML
        labels = labelsOptions.find(label => label.id.toLowerCase() == timeFilter).labels
        for (btn of chartTimeFilters.children) {
            btn.classList.remove('btn-active')
        }
        e.target.classList.add('btn-active')
        myChart.destroy()
        getChartData()
    }
})

convertBtn.addEventListener('click', convert)

reverseBtn.addEventListener('click', () => {
    let temp = basisCurrency.innerHTML
    basisCurrency.innerHTML = finalCurrency.innerHTML
    finalCurrency.innerHTML = temp
})


getChartData()

getNews() 

getRatesData()

