

document.getElementsByXPath = function(expression, parentElement) {
    let r = [];
    let x = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, l = x.snapshotLength; i < l; i++) {
        r.push(x.snapshotItem(i));
    }
    return r;
}

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(f, n) {
    for (let i = 0; i < n; i++) {
      try {
        await f();
        console.log("retry end");
        return;
      } catch (e) {
          console.log("...");
          //console.log(e);
          await _sleep(500);
      }
    }
}

const xp = {
    "戦う":        "/html/body/div/div/div/div[3]/div[2]/div[2]",
    "戦う2":        "/html/body/div/div/div/div[3]/div[3]/div[2]",
    "取り消す":     "/html/body/div/div/div/div[3]/div[4]/div[2]",
    "生誕する":    "/html/body/div/div/div/div[3]/div[6]/div/div[2]",
    "真剣タイマン": "/html/body/div/div/div/div[3]/div[5]/div[3]",
    "許す":         "/html/body/div/div/div/div[3]/div[2]/div[9]/div",
    "捨てる":       "/html/body/div/div/div/div[3]/div[2]/div[7]/div[10]/div[3]/div",
    "Go":          "/html/body/div/div/div/div[3]/div[2]/div[8]/div",
    "自分":         "/html/body/div/div/div/div[3]/div[2]/div[6]/div[2]/div/div/div/div[3]/div",
    "相手":         "/html/body/div/div/div/div[3]/div[2]/div[6]/div[1]/div/div/div/div[1]",
    "買う":         "/html/body/div/div/div/div[3]/div[2]/div[8]/div[1]/div[2]/div",
    "買わない":      "/html/body/div/div/div/div[3]/div[2]/div[8]/div[2]/div[2]/div",
    "MP+10":        "/html/body/div/div/div/div[3]/div[2]/div[9]",
    "カードリスト":  "/html/body/div/div/div/div[3]/div[2]/div[7]",
    "勝利":         "/html/body/div/div/div/div[3]/div[2]/div[3]/div[1]/span",
    "戻る":         "/html/body/div/div/div/div[1]/div[2]/div[2]",
    "勝者名":       "/html/body/div/div/div/div[3]/div[2]/div[3]/div[2]/div/span",
}

function selectCard(index){
    let card = document.getElementsByXPath(`/html/body/div/div/div/div[3]/div[2]/div[7]/div[${index}]/div[3]`)[0];
    let data = document.getElementsByXPath(`/html/body/div/div/div/div[3]/div[2]/div[7]/div[${index}]/div[2]`)[0];
    card.name = data.style.backgroundImage.replace(/.*\/([a-z0-9-]+)\.png.*/, "$1");
    card.type = data.style.backgroundImage.replace(/.*\/([a-z0-9-]+)\/[a-z0-9-]+\.png.*/, "$1");
    return card;
}

async function game(){
    console.log("戦う");
    await _sleep(100);
    await retry(async () => {document.getElementsByXPath(xp["戦う"])[0].click();}, 1);
    await retry(async () => {document.getElementsByXPath(xp["戦う2"])[0].click();}, 1);
    
    // カード配り待機
    await retry(async () => { selectCard(6); }, 10);
    // 待機カウント
    waitCount = 0;
    // ターン操作
    while (true) {
        await turn();
        await _sleep(500);
        // ゲーム終了
        if (document.getElementsByXPath(xp["勝利"])[0] !== undefined) {
            if (document.getElementsByXPath(xp["勝者名"])[0] === undefined) {
                localStorage.else = localStorage.else ? Number(localStorage.else) + 1 : 0;
            } else if (document.getElementsByXPath(xp["勝者名"])[0].innerText === "R*Bot") {
                localStorage.win = localStorage.win ? Number(localStorage.win) + 1 : 0;
            } else {
                localStorage.lose = localStorage.lose ? Number(localStorage.lose) + 1 : 0;
            }
            await _sleep(200);
            document.getElementsByXPath(xp["戻る"])[0].click();
            return;
        } else if (document.getElementsByXPath(xp["生誕する"])[0] !== undefined) {
            await main();
            return;
        } else if (document.getElementsByXPath(xp["取り消す"])[0] !== undefined) {
            waitCount++;
            if (waitCount > 3) {
                console.log("取り消す");
                await retry(async () => {document.getElementsByXPath(xp["取り消す"])[0].click();}, 1);
                return;
            }
        } else if (document.getElementsByXPath(xp["戦う"])[0] !== undefined ||
                document.getElementsByXPath(xp["戦う2"])[0] !== undefined ) {
            return;
        }
    }
    
}

async function turn(){
    console.log("turn start");
    //let cards = await retry(async function() { await getCards(); }, 20);
    //await retry(async () => { selectCard(1); }, 20);
    await retry(async () => {document.getElementsByXPath(xp["カードリスト"])[0].children;}, 5);
    try {
        let cardList = document.getElementsByXPath(xp["カードリスト"])[0].children;
        let cardNum = cardList.length;
    } catch {
        return;
    }

    let cardList = document.getElementsByXPath(xp["カードリスト"])[0].children;
    let cardNum = cardList.length;
    console.log(`カード${cardNum}枚`);

    for (let index = 1; index < cardNum; index++) {
        /*try {
            let card = selectCard(index);
            console.log(card.name);
            console.log(card.type);
        } catch (e) {
            break;
        }*/

        await retry(async function(){
            let card = selectCard(index);
            console.log(card.name);
            console.log(card.type);
            await _sleep(200);
            card.click();
            await _sleep(200);
            console.log("Go");
            document.getElementsByXPath(xp["Go"])[0].click();
            console.log("買う");
            document.getElementsByXPath(xp["買う"])[0].click();
            console.log("許す");
            document.getElementsByXPath(xp["許す"])[0].click();
            await _sleep(200);
            card.click();
            await _sleep(200);
        }, 1);

        await _sleep(200);
        await retry(async () => {document.getElementsByXPath(xp["カードリスト"])[0].children;}, 20);
        try {
            let cardList = document.getElementsByXPath(xp["カードリスト"])[0].children;
            let cardNum = cardList.length;
        } catch (e) {
            return;
        }
    }
}

async function getCards() {
    console.log("getCards start");
    let arr = [];
    for (let i=1; i<25; i++) {
        let card = selectCard(i);
        //console.log(card.name);
        //console.log(card.type);
        //card.click();
        arr.push([card.name, card.type]);
        await _sleep(100);
    }
    
    console.log("getCards end");
    return arr;
}

async function main() {
    // 生誕する
    console.log("生誕する");
    document.getElementsByXPath(xp["生誕する"])[0].click();
    await _sleep(200);
    // 真剣タイマン
    console.log("真剣タイマン");
    await retry(async () => {document.getElementsByXPath(xp["真剣タイマン"])[0].click();}, 2);

    while (true) {
        // 開始
        await game();
        await _sleep(800);
        console.log("game end");
    }
}

await main();
