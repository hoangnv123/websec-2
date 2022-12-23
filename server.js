let Port = process.env.PORT || 5500;
let XMLHttpRequest = require('xhr2');
let http = require('http');
let path = require('path');
let express = require('express');
let app = express();
let server = http.Server(app);
let HTMLParser = require('node-html-parser');
let fs = require('fs');

app.use(express.static(__dirname));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(Port, () => {
    console.log('Server listening on port 5500');
});

app.get('/getGroupsAndTeachers', (req, res) => {
    res.sendFile(path.join(__dirname, 'groupAndTeachers.json'));
})

app.get('/rasp', (req, res) => {
    let request = new XMLHttpRequest();
    let url = "https://ssau.ru" + req.url;
    request.open("GET", url, true);
    request.send(null);
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            let schedule = {
                dates: [],
                dayOfSchedule: [],
                Times: []
            };
            let data = HTMLParser.parse(request.responseText);
            for (let cell of data.querySelectorAll(".schedule__item")) {
                if (cell.querySelector(".lesson-color")) {
                    let listGroups = [];
                    if (!!cell.querySelectorAll(".schedule__group").length) {
                        for (let group of cell.querySelectorAll(".schedule__group")) {
                            if (group.innerText.trim() !== "") {
                                listGroups.push(JSON.stringify({
                                    name: group.innerText,
                                    link: group.getAttribute("href") ?? null
                                }))
                            } else {
                                listGroups.push(JSON.stringify({
                                    name: "",
                                    link: null
                                }))
                            }
                        }
                    } else if (!!cell.querySelectorAll(".schedule__groups").length) {
                        for (let group of cell.querySelectorAll(".schedule__groups")) {
                            if (group.innerText.trim() !== "") {
                                listGroups.push(JSON.stringify({
                                    name: group.innerText,
                                    link: group.getAttribute("href") ?? null
                                }))
                            } else {
                                listGroups.push(JSON.stringify({
                                    name: "",
                                    link: null
                                }))
                            }
                        }
                    }
                    schedule.dayOfSchedule.push({
                        subject: cell.querySelector(".lesson-color").innerText,
                        place: cell.querySelector(".schedule__place").innerText,
                        teacher: JSON.stringify(cell.querySelector(".schedule__teacher > .caption-text") === null ?
                            {
                                name: "",
                                link: null,
                            } :
                            {
                                name: cell.querySelector(".schedule__teacher > .caption-text") ? cell.querySelector(".schedule__teacher > .caption-text").innerText : "",
                                link: cell.querySelector(".schedule__teacher > .caption-text").getAttribute("href")
                            }),
                        groups: listGroups
                    })
                } else if (!!data.querySelectorAll(".schedule__item + .schedule__head").length && !schedule.dates.length) {
                    for (let cell of data.querySelectorAll(".schedule__item + .schedule__head")) {
                        schedule.dates.push(cell.childNodes[0].innerText + cell.childNodes[1].innerText)
                    }
                } else {
                    schedule.dayOfSchedule.push({
                        subject: null
                    })
                }
            }
            for (let cell of data.querySelectorAll(".schedule__time")) {
                schedule.Times.push(cell.childNodes[0].innerText + cell.childNodes[1].innerText);
            }
            schedule["currentWeek"] = data.querySelector(".week-nav-current_week")?.innerText;
            schedule.dayOfSchedule = schedule.dayOfSchedule.slice(6, schedule.dayOfSchedule.length);
            res.send(JSON.stringify(schedule));
        }
    };
})

function getGroupsAndTeacher() {
    let listGroupAndTeacher = { groups: [], teachers: [] };
    let count = 0;
    let responses = [];

    for (let i = 1; i < 6; i++) {
        let request = new XMLHttpRequest();
        let url = "https://ssau.ru/rasp/faculty/492430598?course=" + i;
        request.open("GET", url, true);
        request.send(null);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                let data = HTMLParser.parse(request.responseText);
                let groups = data.querySelectorAll(".group-catalog__groups > a");
                for (let group of groups) {
                    const id = group.getAttribute("href").replace(/\D/g, '');
                    listGroupAndTeacher.groups.push({ name: group.innerText, link: `/rasp?groupId=${id}` })
                }
            }
        };
    }
    for (let i = 1; i < 116; i++) {
        let request = new XMLHttpRequest();
        let url = "https://ssau.ru/staff?page=" + i;
        request.open("GET", url, true);
        request.send(null);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                count++;
                responses.push(request.responseText);
                if (count === 115) {
                    for (let teacher of responses) {
                        let data = HTMLParser.parse(teacher);
                        let teachers = data.querySelectorAll(".list-group-item > a");
                        for (let teacher of teachers) {
                            const id = teacher.getAttribute("href").replace(/\D/g, '');
                            listGroupAndTeacher.teachers.push({ name: teacher.innerText, link: `/rasp?staffId=${id}` })
                        }
                    }
                    fs.writeFileSync("groupAndTeachers.json", JSON.stringify(listGroupAndTeacher));
                }
            }
        };
    }
}
