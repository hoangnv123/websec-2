let currentUrl = '/rasp?groupId=531030143';
let currentWeek;

fetch('/rasp?groupId=531873998')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.crrentWeek === 1)
        {
            const btn = document.querySelector("#previousWeek").style.vibisility = 'hidden';
        }
        else
        {
            const btn = document.querySelector("#previousWeek").style.vibisility = 'visible';
        }
        loadSchedule(data);
    })
    .catch(err => console.log(err))


function loadSchedule(data)
{
    let label = document.getElementById('currentWeek');
    label.innerHTML = data.currentWeek;
    let table = document.querySelector("#schedule");
    for (let child of table.childNodes) {
        table.removeChild(child);
    }
    let firstRow = table.insertRow();
    let textNode = document.createTextNode("Время");
    firstRow.insertCell().appendChild(textNode);
    firstRow.classList.add("header");
    for (let date of data.dates)
    {
        textDate = document.createTextNode(date);
        firstRow.insertCell().appendChild(textDate);
    }
    let daySchedule = data.dayOfSchedule;
    let listTeachers = [];
    for (let i = 0; i < daySchedule.length; i++)
    {
        if(daySchedule[i].subject !== null)
        {
            let teachers = JSON.parse(daySchedule[i].teacher);
            listTeachers.push(teachers);
        }
        else
        {
            let empty = {name: 'null', link: 'null'};
            listTeachers.push(empty);
        }
    }

    let listGroups = []
    for (let i = 0; i < daySchedule.length; i++)
    {
        if(daySchedule[i].subject !== null)
        {
            let elem = [];
            for (let item of daySchedule[i].groups)
            {
                let groups = JSON.parse(item);
                elem.push(groups);
            }
            listGroups.push(elem);
        }
        else
        {
            let empty = {name: 'null', link: 'null'};
            listGroups.push(empty);
        }    
    }

    console.log(listGroups);
    // console.log(listTeachers);
    for (let time = 0; time < 6; time++)
    {
        let rows = table.insertRow();
        rows.insertCell().appendChild(document.createTextNode(data.Times[time]));
        for (let i = 0; i < daySchedule.length; i++)
        {
            if (daySchedule[i].subject == null || listTeachers[i].link == 'null')
            {
                rows.insertCell().appendChild(document.createTextNode(""));
            }
            else
            {
                let cell = rows.insertCell();
                // rows.insertCell().appendChild(document.createTextNode(daySchedule[i].subject));  
                cell.appendChild(document.createTextNode(daySchedule[i].subject));
                cell.appendChild(document.createElement("br"));
                cell.appendChild(document.createTextNode(daySchedule[i].place));
                cell.appendChild(document.createElement("br"));
                cell.appendChild(document.createTextNode(listTeachers[i].name));
                cell.appendChild(document.createElement("br"));

                for (let group of listGroups[i])
                {
                    if (group.name === 'null')
                    {
                        continue;
                    }
                    else
                    {
                        cell.appendChild(document.createTextNode(group.name))
                        cell.appendChild(document.createElement("br"));
                    }
                }
            }
            if(i > 4)
            {
                break;
            }
        }
        daySchedule = daySchedule.slice(6,daySchedule.length);
        listTeachers = listTeachers.slice(6, listTeachers.length);
        listGroups = listGroups.slice(6, listGroups.length);
        // console.log(daySchedule);
    }
}


function reloadSchedule(url)
{
    currentUrl = url;
    fetch(url)
        .then((data) => data.json())
        .then((res) => {
            loadSchedule(res);
            console.log(res);
            currentWeek = parseInt(res.currentWeek);
            document.querySelector("#currentWeek").innerHTML = `${currentWeek} неделя`;
            if (currentWeek == 1) 
            {
                document.querySelector("#previousWeek").style.visibility = "hidden";
            } 
            else 
            {
                document.querySelector("#previousWeek").style.visibility = "visible";
            }
            if (currentWeek > 17)
            {
                document.querySelector("#nextWeek").style.visibility = "hidden";
            }
            else
            {
                document.querySelector("#nextWeek").style.visibility = "visible";
            }
        })
}


function changeWeek(nextWeek)
{
    fetch(currentUrl)
        .then(res => res.json())
        .then(data => {
            currentWeek = data.currentWeek;
            currentWeek = parseInt(currentWeek);
            currentUrl += `&selectedWeek=${nextWeek ? currentWeek + 1 + "" : currentWeek - 1 + ""}`;
            reloadSchedule(currentUrl);
        });
}

fetch('/getGroupsAndTeachers')
    .then(response => response.json())
    .then(data => {
        let groups = document.querySelector("#selectGroups");
        for (let group of data.groups)
        {
            let list_groups = document.createElement('option');
            list_groups.innerHTML = group.name;
            list_groups.setAttribute('value', group.link);
            groups.appendChild(list_groups);
        }
        groups.addEventListener('change', () => {
            reloadSchedule(groups.value);
        })

        let teachers = document.querySelector("#selectTeachers");
        for (let teacher of data.teachers)
        {
            let list_teachers= document.createElement('option');
            list_teachers.innerHTML = teacher.name;
            list_teachers.setAttribute('value', teacher.link);
            teachers.appendChild(list_teachers);
            // console.log(teacher.link);
        }
        teachers.addEventListener('change', () => {
            reloadSchedule(teachers.value);
        })
        
    })

