const jaqwiDB = JSON.parse(window.localStorage.getItem('jaqwiDB'));
const wordDB = JSON.parse(window.localStorage.getItem('wordDB'));
const wL = JSON.parse(window.localStorage.getItem('wL'));
let userDB = JSON.parse(window.localStorage.getItem('userDB'));
let wlaudDB = JSON.parse(window.localStorage.getItem('wlaudDB'));

let userMsg;
let userMsgs;
let userCommand;
let userArguement;
let userName;
let isHuman = true;
let isWlaud = false;
let jaqwiing = false;
let jaqwiTheme;
let jaqwiWord;
let jaqwiFail;
let life = true;

// 메시지를 보내주는 함수
function talk(a) {
    $("#Talk").val(a);
    $("#ChatBtn").trigger('click');
}

// 일반 메시지의 앞 단어가 a와 일치하는 지를 뱉어주는 함수
function isFirstMsg(a) {
    return userMsg.substring(0, a.length) === a;
}

// 일반 메시지의 앞 단어를 뺀 것을 뱉어주는 함수
function noFirstMsg(a) {
    return userMsg.substring(a.length);
}

// 대화 모드에 해당하는 말을 뱉어주는 함수
function tm(a) {
    return userDB[userName].talkmode == "banmo" ? a.banmo
    : userDB[userName].talkmode == "jonmo" ? a.jonmo
    : a.banmo;
}

// [이름]을 유저 이름으로 바꿔주는 함수
function replaceName(str) {
    return str.replace(/\[이름\]/g, userName)
}

// 1~a 사이의 랜덤한 수와 조사를 붙여서 뱉어주는 함수
function dice(a) {
    const dicenumber = Math.floor(a*Math.random()) + 1;
    return [1, 3, 6, 7, 8, 0].includes(dicenumber % 10)
    ? `${dicenumber}이`
    : `${dicenumber}가`
}

// 리스트 중 랜덤한 것을 뱉어주는 함수
function random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// 단어나 문장을 한글 글자를 그 자음으로 바꿔서 뱉어주는 함수
function jaum(str) {
    cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    result = "";
    for(i = 0; i < str.length; i++) {
        code = str.charCodeAt(i)-44032;
        if (code>-1 && code<11172) result += cho[Math.floor(code/588)];
        else result += str.charAt(i);
    }
    return result;
}

// localStorage userDB 업데이트
function setUserDB() {
    window.localStorage.setItem('userDB', JSON.stringify(userDB));
}

// localStorage wlaudDB 업데이트
function setwlaudDB() {
    window.localStorage.setItem('wlaudDB', JSON.stringify(wlaudDB));
}

const targetNode = document.getElementById('Chat');
const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver(() => {

    userMsg = $(".chat-body").last().text();
    userMsgs = userMsg.split(' ');
    userCommand = userMsgs[0];
    userArguement = userMsgs.slice(1).join(' ');
    userName = $(".chat-head").last().text();
    isHuman = !(["wlaudbot", "알림", ""].includes(userName));
    isWlaud = userName === "wlaud";
    date = new Date();

    if (isHuman) {
        if (!(userName in userDB)) {
            userDB[userName] = {
                name: userName,
                talkmode: "banmo",
                exp: 10,
                money: 0,
                havejonmo: false,
            };
            setUserDB();
        } else {
            userDB[userName].exp += 10;
        }

        if (life || isWlaud) {
            switch (userCommand) {
                case "지명봇":
                    switch (userMsgs[1]) {
                        case undefined:
                            talk(tm(wL.wlaudbot));
                            break;
                        case "단어":
                            const wlaudbotAddWord = userMsgs[2];
                            const wlaudbotAddWordMean = userMsgs.slice(3).join(' ')
                            if(wlaudbotAddWordMean != "") {
                                if (!(wlaudbotAddWord in wlaudDB)) {
                                    wlaudDB[wlaudbotAddWord] = {
                                    title: wlaudbotAddWordMean,
                                    teacher: userName,
                                    time: `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`,
                                    };
                                    setwlaudDB();
                                    talk(tm(wL.wlauddaneook));
                                } else {
                                    talk(tm(wL.wlaudalready));
                                };
                            } else {
                                talk(tm(wL.wlaudempty));
                            };
                            break;
                        case "삭제":
                            const wlaudbotDeleteWord = userMsgs.slice(2).join(' ');
                            if(wlaudbotDeleteWord in wlaudDB) {
                                if(wlaudDB[wlaudbotDeleteWord].teacher == userName || isWlaud) {
                                    delete wlaudDB[wlaudbotDeleteWord];
                                    setwlaudDB();
                                    talk(tm(wL.wlauddeleteok));
                                } else {
                                    talk(tm(wL.wlaudcantdelete));
                                };
                            } else {
                                talk(tm(wL.wlaudno));
                            };
                            break;
                        case "정보":
                            const wlaudbotInfoWord = userMsgs.slice(2).join(' ');
                            if (wlaudbotInfoWord in wlaudDB) {
                                const wlaudbotInfoWordTeacher = wlaudDB[wlaudbotInfoWord].teacher;
                                const wlaudbotInfoWordTime = wlaudDB[wlaudbotInfoWord].time;
                                switch (userDB[wlaudDB[wlaudbotInfoWord].teacher].talkmode) {
                                    case "banmo":
                                        talk(`알려준 놈: ${wlaudbotInfoWordTeacher}`);
                                        talk(`알려준 시간: ${wlaudbotInfoWordTime}`);
                                        break;
                                    case "jonmo":
                                        talk(`알려주신 분: ${wlaudbotInfoWordTeacher}`);
                                        talk(`알려주신 시간: ${wlaudbotInfoWordTime}`);
                                        break;
                                    default:
                                        talk(`알려준 놈: ${wlaudbotInfoWordTeacher}`);
                                        talk(`알려준 시간: ${wlaudbotInfoWordTime}`);
                                };
                            } else {
                                talk(tm(wL.wlaudno));
                            };
                            break;
                        default:
                            const wlaudbotWord = userMsgs.slice(1).join(' ');
                            talk((wlaudbotWord) in wlaudDB ? replaceName(wlaudDB[wlaudbotWord].title) : tm(wL.wlaudno));
                    };
                    break;
                case "명령어":
                    switch (userArguement) {
                        case "":
                        case "1":
                            talk(`[명령어] 1페이지 | 3/5`)
                            talk(`정보 (이름): ${tm(wL.helpinfo)}`);
                            talk(`모드: ${tm(wL.helptm)}`);
                            talk(`상점: ${tm(wL.helpshop)}`);
                            talk(`명령어 (1/2/돈벌기/지명봇/정규식)${tm(wL.help)}`);
                            break;
                        case "2":
                            talk(`[명령어] 2페이지 | 5/5`)
                            talk(`랭킹 (페이지): ${tm(wL.helpranking)}`);
                            talk(`검색 (정규식) (페이지): ${tm(wL.helpsearch)}`);
                            // talk(`주사위 (수): ${tm(wL.helpdice)}`);
                            talk(`명령어 (1/2/돈벌기/지명봇/정규식)${tm(wL.help)}`);
                            break;
                        case "돈벌기":
                            talk(`[명령어] 돈벌기 페이지 | 1/1`)
                            talk(`자퀴: ${tm(wL.helpjaqwi)}`);
                            // talk(`도박 (돈): ${tm(wL.helpgambl)}`);
                            talk(`명령어 (1/2/돈벌기/지명봇/정규식)${tm(wL.help)}`);
                            break;
                        case "지명봇":
                            talk(`[명령어] 지명봇 페이지 | 3/3`)
                            talk(`지명봇 (단어): ${tm(wL.helpwlaudbot)}`);
                            talk(`지명봇 단어 (단어) (뜻): ${tm(wL.helpwlaudbotdaneo)}`);
                            talk(`지명봇 정보 (단어): ${tm(wL.helpwlaudbotinfo)}`);
                            talk(`명령어 (1/2/돈벌기/지명봇/정규식)${tm(wL.help)}`);
                            break;
                        case "정규식":
                            talk(`[명령어] 정규식 페이지 | 검색 (정규식) (페이지)에 쓰이는 정규식입니다. | 3/3`)
                            talk(`^(단어): (단어)로 시작함. | (단어): (단어)가 포함됨. | (단어)$: (단어)로 끝남.　　　　　　　　　　　　　　　　 .*: 아무 단어가 있거나 없음. | (.): 아무 문자를 저장함. | \\1: 그 문자가 포함됨.`);
                            talk(``);
                            talk(`예시1: ^이.*라.*어$ ->'이'로 시작하고 '라'가 2개 들어가고 '어'로 끝남.`);
                            talk(`예시2: ^(.).*\\1$ -> 시작 글자와 끝 글자가 같음.`);
                            talk(`명령어 (1/2/돈벌기/지명봇/정규식)${tm(wL.help)}`);
                            break;
                        default:
                            talk(tm(wL.nohelp));
                    };
                    break;
                case "자퀴":
                    if (!jaqwiing) {
                        jaqwiing = true;

                        jaqwiTheme = random(Object.keys(jaqwiDB));
                        jaqwiWord = random(jaqwiDB[jaqwiTheme].words);
        
                        jaqwiFail = setTimeout(function() {
                            jaqwiing = false;
                            talk(`타임 오버!`);
                            talk(`정답: ${jaqwiWord}`);
                        }, 10000);
        
                        talk(`<${jaqwiTheme}> ${jaum(jaqwiWord)} / 제한 시간 : 10초`)
                    } else {
                        talk(tm(wL.jaqwiwait));
                    }
                    break;
                case jaqwiWord:
                    if (jaqwiing) {
                        jaqwiing = false;
            
                        
                        userDB[userName].exp += 100;
                        userDB[userName].money += 1000;
                        setUserDB();
            
                        clearTimeout(jaqwiFail);
            
                        talk(`${userName}${tm(wL.nim)} 정답! Lv.${Math.floor(userDB[userName].exp / 1000) + 1} ${userDB[userName].exp}/${userDB[userName].exp + 1000 - (userDB[userName].exp % 1000)}점 (+100점)  / 돈: ${userDB[userName].money}원 (+1000원)`);
                        talk(`정답: ${jaqwiWord}`);
                    };
                    break;
                case "정보":
                    switch (userArguement) {
                        case "":
                            const infouser = userDB[userName];
                            talk(`${userName}${tm(wL.nim)}의 정보`);
                            talk(`Lv.${Math.floor(infouser.exp / 1000) + 1} ${infouser.exp}/${infouser.exp + 1000 - (infouser.exp % 1000)}점`);
                            talk(`돈: ${infouser.money}원`);
                            break;
                        default:
                            if (userArguement in userDB) {
                                const infouser = userDB[userArguement];
                                talk(`${infouser.name}${tm(wL.nim)}의 정보`);
                                talk(`Lv.${Math.floor(infouser.exp / 1000) + 1} ${infouser.exp}/${infouser.exp + 1000 - (infouser.exp % 1000)}점`);
                                talk(`돈: ${infouser.money}원`);
                            } else {
                                talk(tm(wL.infono));
                            };
                    }
                    break;
                case "모드":
                    switch (userArguement) {
                        case "":
                            const isbanmo = userDB[userName].talkmode == "banmo" ? "[반모] (적용 중)" : "[반모]";
                            const isjonmo = userDB[userName].talkmode == "jonmo" ? "[존모] (적용 중)"
                            : userDB[userName].havejonmo ? "[존모]"
                            : "[존모] (미구입)";
                            talk(`[대화 모드] ㅣ 모드 (모드 이름)${tm(wL.tm)}`);
                            talk(`${isbanmo} / ${isjonmo}`);
                            break;
                        case "반모":
                            userDB[userName].talkmode = "banmo"
                            setUserDB();
                            talk(tm(wL.tmupdate));
                            break;
                        case "존모":
                            if (userDB[userName].havejonmo == true) {
                                userDB[userName].talkmode = "jonmo"
                                setUserDB();
                                talk(tm(wL.tmupdate));
                            } else {
                                talk(tm(wL.nohave));
                            };
                            break;
                        default:
                            talk(tm(wL.notm));
                    };
                    break;
                case "상점":
                    talk(`[상점] ㅣ 구입 (구입할 것)${tm(wL.shop)}`)
                    userDB[userName].havejonmo
                    ? talk(`[존모] (구입 됨): 존댓말 모드`)
                    : talk(`[존모]: 존댓말 모드${tm(wL.abletm)} / 5000원`);
                    break;
                case "구입":
                    switch (userArguement) {
                        case "":
                            talk(`구입 (구입할 것)${tm(wL.shop)}`);
                            break;
                        case "존모":
                            if (userDB[userName].havejonmo == true) {
                                talk(tm(wL.alreadybuy));
                            } else {
                                if (userDB[userName].money < 5000) {
                                    talk(tm(wL.nomoney));
                                } else {
                                    userDB[userName].money -= 5000;
                                    userDB[userName].havejonmo = true;
                                    talk(tm(wL.buy));
                                    setUserDB();
                                };
                            };
                            break;
                        default:
                            talk(tm(wL.noitem));
                    };
                    break;
                case "랭킹":
                    const rankingPage = userArguement || 1;
                    if (rankingPage % 1 != 0 || rankingPage <= 0) {
                        talk(tm(wL.wrongpage));
                    } else {
                        talk(`[랭킹] ${rankingPage}페이지 | ${rankingPage * 5 - 4}~${rankingPage * 5}위`);
                        Object.entries(userDB)
                        .sort((a, b) => b[1].exp - a[1].exp)
                        .slice(rankingPage * 5 - 5, rankingPage * 5)
                        .forEach((item, index) => {
                            talk(`${rankingPage * 5 - 4 + index}위 ${item[1].name} Lv.${Math.floor(item[1].exp / 1000) + 1} ${item[1].exp}점`)
                        });
                    }
                    break;
                case "검색":
                    const searchPage = userMsgs[2] || 1;
                    if (searchPage % 1 != 0 || searchPage <= 0) {
                        talk(tm(wL.wrongpage));
                    } else {
                        const words = wordDB.filter(str => new RegExp(userMsgs[1]).test(str))
                        talk(`[검색] ${searchPage}페이지 | ${searchPage * 5 > words.length ? words.length : searchPage * 5}/${words.length}`);
                        words.slice(searchPage * 5 - 5, searchPage * 5)
                        .forEach(item => {
                            talk(item);
                        });
                    }
                    break;
                // case "주사위":
                //     if (userArguement === "") {
                //         talk(`${dice(6)}${tm(wL.dice)}`);
                //     } else {
                //         const a = Number(userArguement);
                //         a % 1 == 0 && a > 0 && a < 1000000000000
                //         ? talk(`${dice(noFirstMsg("주사위 "))}${tm(wL.dice)}`)
                //         : talk(tm(wL.dicesidesrange));
                //     }
                //     break;
                // case "도박":
                //     const userMoney = userDB[userName].money;
                //     switch (userArguement) {
                //         case "":
                //             talk(tm(wL.emptymoney));
                //             break;
                //         case "올인":
                //             if (userMoney < 1000) {
                //                 talk(tm(wL.mmoney));
                //             } else if (Math.floor(2*Math.random()) == 0) {
                //                 talk(`${tm(wL.gamblwin)} ${userName}${tm(wL.nim)}의 돈: ${userMoney * 2}원 (+${userMoney}원)`);
                //                 userDB[userName].money *= 2;
                //                 setUserDB();
                //             } else {
                //                 talk(`${tm(wL.gambllose)} ${userName}${tm(wL.nim)}의 돈: 0원 (-${userMoney}원)`);
                //                 userDB[userName].money = 0;
                //                 setUserDB();
                //             };
                //             break;
                //         default:
                //             const gamblmoney = Number(noFirstMsg("도박 "))
                //             if (gamblmoney % 1 != 0) {
                //                 talk(tm(wL.notmoney));
                //             } else if (gamblmoney < 1000) {
                //                 talk(tm(wL.mmoney));
                //             } else if (gamblmoney > userDB[userName].money) {
                //                 talk(tm(wL.lessmoney));
                //             } else if (Math.floor(2*Math.random()) == 0) {
                //                 talk(`${tm(wL.gamblwin)} ${userName}${tm(wL.nim)}의 돈: ${userMoney + gamblmoney}원 (+${gamblmoney}원)`);
                //                 userDB[userName].money += gamblmoney;
                //                 setUserDB();
                //             } else {
                //                 talk(`${tm(wL.gambllose)} ${userName}${tm(wL.nim)}의 돈: ${userMoney - gamblmoney}원 (-${gamblmoney}원)`);
                //                 userDB[userName].money -= gamblmoney;
                //                 setUserDB();
                //             }
                //     }
                //     break;
            }
        };

        if (isWlaud) {
            switch (userMsg) {
                case "핫하 죽어라":
                    talk("크아아아악");
                    life = false;
                    break;
                case "\"소리 없는 죽음\"":
                    life = false;
                    break;
                case "어이 살아라":
                    talk("지옥에서 돌아왔다...");
                    life = true;
                    break;
                case "\"소리 없는 부활\"":
                    life = true;
                    break;
                case "...이 「비술」만은 쓰지 않으려고 했는데... 『소.멸.하.라.』":
                    talk("큭... 오마에... 어째서...")
                    observer.disconnect();
                    break;
                case "\"소리 없는 『소멸』\"":
                    observer.disconnect();
                    break;
                case "훠이":
                    if ($('.RoomBox')[0].style.display === 'block') $("#ExitBtn").trigger('click');
                    break;
            };
            switch (userCommand) {
                case "드루와":
                    if ($('.RoomBox')[0].style.display === 'none') $(`#room-${userArguement}`).trigger('click');
                    break;
            }
        };
    }
});

observer.observe(targetNode, config);