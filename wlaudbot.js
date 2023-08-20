const WebSocket = require('ws');
const fs = require('fs');

const domain = 'safehosting.xyz';
const lobbyPort = '2053';
const roomPort = '2083';
const key = '';
const wlaudKey = "discord-947498683300212757";

const jaqwiDB = JSON.parse(reader('./jaqwiDB.json'))
const wordDB = JSON.parse(reader('./wordDB.json'))
const wL = JSON.parse(reader('./language.json'))
let userDB = JSON.parse(reader('./userDB.json'))
let wlaudDB = JSON.parse(reader('./wlaudDB.json'))

let jaqwiing = false;
let jaqwiWord;
let jaqwiFail;
let life = true;

// 파일 읽기
function reader(file) {
    return fs.readFileSync(file, 'utf8');
}

// 파일 뱉기
function writer(file, content) {
    fs.writeFileSync(file, content, 'utf8');
}

// 요청하는 함수
function send(w, data) {
    w.send(JSON.stringify(data));
}

// 메시지를 보내주는 함수
function talk(w, a) {
    if (life) send(w, {type: 'talk', value: a});
}

// 대화 모드에 해당하는 말을 뱉어주는 함수
function tm(userId, a) {
    return userDB[userId].talkmode == "banmo" ? a.banmo
    : userDB[userId].talkmode == "jonmo" ? a.jonmo
    : a.banmo;
}

// [이름]을 유저 이름으로 바꿔주는 함수
function replaceName(userName, str) {
    return str.replace(/\[이름\]/g, userName)
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

// 레벨 계산
function lv(exp) {
    return Math.floor(exp / 1000) + 1
}

// 필요 경험치 계산
function nextLvExp() {
    return exp + 1000 - (exp % 1000)
}

// userDB 업데이트
function setUserDB() {
    writer('./userDB.json', JSON.stringify(userDB));
}

// wlaudDB 업데이트
function setwlaudDB() {
    writer('./wlaudDB.json', JSON.stringify(wlaudDB));
}

// 웹소켓 연결
function newWs(port, chan = "", room = "") {
    const url = `wss://${domain}:${port}/${key}${chan !== "" ? `&${chan}` : ''}${room !== "" ? `&${room}` : ''}`;
    const ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('접속');
    });

    ws.on('message', (data) => {
        const D = JSON.parse(data);
        console.log(D);
        if (D.type === 'chat' && D.notice === false) {
            const userMsg = D.value;
            const userMsgs = userMsg.split(' ');
            const userCommand = userMsgs[0];
            const userArguement = userMsgs.slice(1).join(' ');
            const userId = D.profile.id;
            const userName = D.profile.title;
            const isHuman = !([key].includes(userId));
            const isWlaud = userId === wlaudKey;
            const date = new Date();

            if (isHuman) {        
                if (!(userId in userDB)) {
                    userDB[userId] = {
                        "name": userName,
                        "id": userId,
                        "talkmode": "banmo",
                        "exp": 10,
                        "money": 0,
                        "havejonmo": false,
                    };
                } else {
                    userDB[userId].exp += 10;
                }

                if (life || isWlaud) {
                    switch (userCommand) {
                        case "지명봇": {
                            switch (userMsgs[1]) {
                                case undefined: {
                                    talk(ws, tm(userId, wL.wlaudbot));
                                    break;
                                }
                                case "단어": {
                                    const wlaudbotAddWord = userMsgs[2];
                                    const wlaudbotAddWordMean = userMsgs.slice(3).join(' ')
                                    if(wlaudbotAddWordMean != "") {
                                        if (!(wlaudbotAddWord in wlaudDB)) {
                                            wlaudDB[wlaudbotAddWord] = {
                                            "title": wlaudbotAddWordMean,
                                            "teacherName": userName,
                                            "teacherId": userId,
                                            "time": `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`,
                                            };
                                            setwlaudDB();
                                            talk(ws, tm(userId, wL.wlauddaneook));
                                        } else {
                                            talk(ws, tm(userId, wL.wlaudalready));
                                        };
                                    } else {
                                        talk(ws, tm(userId, wL.wlaudempty));
                                    };
                                    break;
                                }
                                case "삭제": {
                                    const wlaudbotDeleteWord = userMsgs.slice(2).join(' ');
                                    if(wlaudbotDeleteWord in wlaudDB) {
                                        if(wlaudDB[wlaudbotDeleteWord].teacherId == userId || isWlaud) {
                                            delete wlaudDB[wlaudbotDeleteWord];
                                            setwlaudDB();
                                            talk(ws, tm(userId, wL.wlauddeleteok));
                                        } else {
                                            talk(ws, tm(userId, wL.wlaudcantdelete));
                                        };
                                    } else {
                                        talk(ws, tm(userId, wL.wlaudno));
                                    };
                                    break;
                                }
                                case "정보": {
                                    const wlaudbotInfoWord = userMsgs.slice(2).join(' ');
                                    if (wlaudbotInfoWord in wlaudDB) {
                                        const wlaudbotInfoWordTeacher = wlaudDB[wlaudbotInfoWord].teacherName;
                                        const wlaudbotInfoWordTime = wlaudDB[wlaudbotInfoWord].time;
                                        switch (userDB[wlaudDB[wlaudbotInfoWord].teacher].talkmode) {
                                            case "banmo": {
                                                talk(ws, `알려준 놈: ${wlaudbotInfoWordTeacher}`);
                                                talk(ws, `알려준 시간: ${wlaudbotInfoWordTime}`);
                                                break;
                                            }
                                            case "jonmo": {
                                                talk(ws, `알려주신 분: ${wlaudbotInfoWordTeacher}`);
                                                talk(ws, `알려주신 시간: ${wlaudbotInfoWordTime}`);
                                                break;
                                            }
                                            default: {
                                                talk(ws, `알려준 놈: ${wlaudbotInfoWordTeacher}`);
                                                talk(ws, `알려준 시간: ${wlaudbotInfoWordTime}`);
                                            }
                                        };
                                    } else {
                                        talk(ws, tm(userId, wL.wlaudno));
                                    };
                                    break;
                                }
                                default: {
                                    const wlaudbotWord = userMsgs.slice(1).join(' ');
                                    talk(ws, (wlaudbotWord) in wlaudDB ? replaceName(userName, wlaudDB[wlaudbotWord].title) : tm(userId, wL.wlaudno));
                                }
                            };
                            break;
                        }
                        case "명령어": {
                            switch (userArguement) {
                                case "":
                                case "1": {
                                    talk(ws, `[명령어] 1페이지 | 3/5`)
                                    talk(ws, `정보 (이름): ${tm(userId, wL.helpinfo)}`);
                                    talk(ws, `모드: ${tm(userId, wL.helptm)}`);
                                    talk(ws, `상점: ${tm(userId, wL.helpshop)}`);
                                    talk(ws, `명령어 (1/2/돈벌기/지명봇/정규식)${tm(userId, wL.help)}`);
                                    break;
                                }
                                case "2": {
                                    talk(ws, `[명령어] 2페이지 | 5/5`)
                                    talk(ws, `랭킹 (페이지): ${tm(userId, wL.helpranking)}`);
                                    talk(ws, `검색 (정규식) (페이지): ${tm(userId, wL.helpsearch)}`);
                                    talk(ws, `명령어 (1/2/돈벌기/지명봇/정규식)${tm(userId, wL.help)}`);
                                    break;
                                }
                                case "돈벌기": {
                                    talk(ws, `[명령어] 돈벌기 페이지 | 1/1`)
                                    talk(ws, `자퀴: ${tm(userId, wL.helpjaqwi)}`);
                                    talk(ws, `명령어 (1/2/돈벌기/지명봇/정규식)${tm(userId, wL.help)}`);
                                    break;
                                }
                                case "지명봇": {
                                    talk(ws, `[명령어] 지명봇 페이지 | 3/3`)
                                    talk(ws, `지명봇 (단어): ${tm(userId, wL.helpwlaudbot)}`);
                                    talk(ws, `지명봇 단어 (단어) (뜻): ${tm(userId, wL.helpwlaudbotdaneo)}`);
                                    talk(ws, `지명봇 정보 (단어): ${tm(userId, wL.helpwlaudbotinfo)}`);
                                    talk(ws, `명령어 (1/2/돈벌기/지명봇/정규식)${tm(userId, wL.help)}`);
                                    break;
                                }
                                case "정규식": {
                                    talk(ws, `[명령어] 정규식 페이지 | 검색 (정규식) (페이지)에 쓰이는 정규식입니다. | 3/3`)
                                    talk(ws, `^(단어): (단어)로 시작함. | (단어): (단어)가 포함됨. | (단어)$: (단어)로 끝남.　　　　　　　　　　　　　　　　 .*: 아무 단어가 있거나 없음. | (.): 아무 문자를 저장함. | \\1: 그 문자가 포함됨.`);
                                    talk(ws, ``);
                                    talk(ws, `예시1: ^이.*라.*어$ ->'이'로 시작하고 '라'가 2개 들어가고 '어'로 끝남.`);
                                    talk(ws, `예시2: ^(.).*\\1$ -> 시작 글자와 끝 글자가 같음.`);
                                    talk(ws, `명령어 (1/2/돈벌기/지명봇/정규식)${tm(userId, wL.help)}`);
                                    break;
                                }
                                default: {
                                    talk(ws, tm(userId, wL.nohelp));
                                }
                            };
                            break;
                        }
                        case "자퀴": {
                            if (!jaqwiing) {
                                jaqwiing = true;

                                const jaqwiTheme = random(Object.keys(jaqwiDB));
                                jaqwiWord = random(jaqwiDB[jaqwiTheme].words);
                
                                jaqwiFail = setTimeout(() => {
                                    jaqwiing = false;
                                    talk(ws, `타임 오버!`);
                                    talk(ws, `정답: ${jaqwiWord}`);
                                }, 10000);
                
                                talk(ws, `<${jaqwiTheme}> ${jaum(jaqwiWord)} / 제한 시간 : 10초`)
                            } else {
                                talk(ws, tm(userId, wL.jaqwiwait));
                            }
                            break;
                        }
                        case jaqwiWord: {
                            if (jaqwiing) {
                                jaqwiing = false;

                                userDB[userId].exp += 100;
                                userDB[userId].money += 1000;
                    
                                clearTimeout(jaqwiFail);
                    
                                const user = userDB[userId];
                                talk(ws, `${userName}${tm(userId, wL.nim)} 정답! Lv.${String(lv(user.exp))} ${String(user.exp)}/${String(nextLvExp(user.exp))}점 (+100점)  / 돈: ${String(user.money)}원 (+1000원)`);
                                talk(ws, `정답: ${jaqwiWord}`);
                            };
                            break;
                        }
                        case "정보": {
                            switch (userArguement) {
                                case "": {
                                    const user = userDB[userId];
                                    talk(ws, `${userName}${tm(userId, wL.nim)}의 정보`);
                                    talk(ws, `Lv.${String(lv(user.exp))} ${String(user.exp)}/${String(nextLvExp(user.exp))}점`);
                                    talk(ws, `돈: ${user.money}원`);
                                    break;
                                }
                                default: {
                                    if (userArguement in userDB) {
                                        const user = userDB[userArguement];
                                        talk(ws, `${user.name}${tm(userId, wL.nim)}의 정보`);
                                        talk(ws, `Lv.${String(lv(user.exp))} ${String(user.exp)}/${String(nextLvExp(user.exp))}점`);
                                        talk(ws, `돈: ${user.money}원`);
                                    } else {
                                        talk(ws, tm(userId, wL.infono));
                                    };
                                }
                            }
                            break;
                        }
                        case "모드": {
                            const user = userDB[userId];
                            switch (userArguement) {
                                case "": {
                                    const isbanmo = user.talkmode == "banmo" ? "[반모] (적용 중)" : "[반모]";
                                    const isjonmo = user.talkmode == "jonmo" ? "[존모] (적용 중)"
                                    : userDB[userId].havejonmo ? "[존모]"
                                    : "[존모] (미구입)";
                                    talk(ws, `[대화 모드] ㅣ 모드 (모드 이름)${tm(userId, wL.tm)}`);
                                    talk(ws, `${isbanmo} / ${isjonmo}`);
                                    break;
                                }
                                case "반모": {
                                    userDB[userId].talkmode = "banmo"
                                    talk(ws, tm(userId, wL.tmupdate));
                                    break;
                                }
                                case "존모": {
                                    if (user.havejonmo == true) {
                                        userDB[userId].talkmode = "jonmo"
                                        talk(ws, tm(userId, wL.tmupdate));
                                    } else {
                                        talk(ws, tm(userId, wL.nohave));
                                    };
                                    break;
                                }
                                default: {
                                    talk(ws, tm(userId, wL.notm));
                                }
                            };
                            break;
                        }
                        case "상점": {
                            const user = userDB[userId];
                            talk(ws, `[상점] ㅣ 구입 (구입할 것)${tm(userId, wL.shop)}`)
                            userDB[userId].havejonmo
                            ? talk(ws, `[존모] (구입 됨): 존댓말 모드`)
                            : talk(ws, `[존모]: 존댓말 모드${tm(userId, wL.abletm)} / 5000원`);
                            break;
                        }
                        case "구입": {
                            const user = userDB[userId];
                            switch (userArguement) {
                                case "": {
                                    talk(ws, `구입 (구입할 것)${tm(userId, wL.shop)}`);
                                    break;
                                }
                                case "존모": {
                                    if (user.havejonmo == true) {
                                        talk(ws, tm(userId, wL.alreadybuy));
                                    } else {
                                        if (user.money < 5000) {
                                            talk(ws, tm(userId, wL.nomoney));
                                        } else {
                                            userDB[userId].money -= 5000;
                                            userDB[userId].havejonmo = true;
                                            talk(ws, tm(userId, wL.buy));
                                        };
                                    };
                                    break;
                                }
                                default: {
                                    talk(ws, tm(userId, wL.noitem));
                                }
                            };
                            break;
                        }
                        case "랭킹": {
                            const rankingPage = Number(userArguement || 1);
                            if (rankingPage % 1 != 0 || rankingPage <= 0) {
                                talk(ws, tm(userId, wL.wrongpage));
                            } else {
                                talk(ws, `[랭킹] ${rankingPage}페이지 | ${rankingPage * 5 - 4}~${rankingPage * 5}위`);
                                Object.entries(userDB)
                                .sort((a, b) => b[1].exp - a[1].exp)
                                .slice(rankingPage * 5 - 5, rankingPage * 5)
                                .forEach((item, index) => {
                                    const user = item[1]
                                    talk(ws, `${rankingPage * 5 - 4 + index}위 ${user.name} Lv.${String(lv(user.exp))} ${String(user.exp)}점`)
                                });
                            }
                            break;
                        }
                        case "검색": {
                            const searchPage = Number(userMsgs[2] || 1);
                            if (searchPage % 1 != 0 || searchPage <= 0) {
                                talk(ws, tm(userId, wL.wrongpage));
                            } else {
                                const words = wordDB.filter(str => new RegExp(userMsgs[1]).test(str))
                                talk(ws, `[검색] ${searchPage}페이지 | ${searchPage * 5 > words.length ? words.length : searchPage * 5}/${words.length}`);
                                words.slice(searchPage * 5 - 5, searchPage * 5)
                                .forEach(item => {
                                    talk(ws, item);
                                });
                            }
                            break;
                        }
                        case "도박": {
                            switch (userArguement) {
                                case "": {
                                    talk(ws, tm(userId, wL.emptymoney));
                                    break;
                                }
                                case "올인": {
                                    userDB[userId].money = 0;
                                    talk(ws, `도박신고는 1336 ${userName}${tm(userId, wL.nim)}의 돈: 0원 (-${userArguement}원)`);
                                    break;
                                }
                                default: {
                                    const user = userDB[userId];
                                    if (userArguement % 1 != 0) {
                                        talk(ws, tm(userId, wL.notmoney));
                                    } else if (userArguement < 1000) {
                                        talk(ws, tm(userId, wL.mmoney));
                                    } else if (userArguement > user.money) {
                                        talk(ws, tm(userId, wL.lessmoney));
                                    } else {
                                        userDB[userId].money -= Number(userArguement);
                                        talk(ws, `도박신고는 1336 ${userName}${tm(userId, wL.nim)}의 돈: ${String(user.money)}원 (-${userArguement}원)`);
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }

                if (isWlaud) {
                    switch (userMsg) {
                        case "핫하 죽어라": {
                            talk(ws, "크아아아악");
                            life = false;
                            break;
                        }
                        case "어이 살아라": {
                            life = true;
                            talk(ws, "지옥에서 돌아왔다...");
                            break;
                        }
                        case "소.멸.하.라.": {
                            talk(ws, "큭... 오마에... 어째서...");
                            observer.disconnect();
                            break;
                        }
                        case "관전": {
                            send(ws, {"type":"form","mode":"S"})
                            break;
                        }
                        case "훠이": {
                            send(ws, {"type":"leave"});
                            ws.close();
                            return;
                            break;
                        }
                    };
                    switch (userCommand) {
                        case "드루와": {
                            send(ws, {"type":"enter","id":userArguement});
                            newWs(roomPort, '1', userArguement);
                            break;
                        }
                    }
                };
            }

            setUserDB();
        }
    });

    ws.on('close', () => {
        console.log('접속 종료');
    });

    ws.on('error', (error) => {
        console.error(error);
    });
}

newWs(lobbyPort);