//==================================================
// 温泉予約システム
// 予約画面
//==================================================


let unitPrice = 0;

let people = 1;

let selectedDate = null;


// カレンダー用
let calendarData = [];

let currentMonth = new Date();


// 表示範囲
let minMonth = new Date();

minMonth.setDate(1);


let maxMonth = new Date();

maxMonth.setMonth(
  maxMonth.getMonth() + 2
);

maxMonth.setDate(1);



//==================================================
// 初期処理
//==================================================

document.addEventListener(

  "DOMContentLoaded",

  async()=>{


    await loadPrices();

    await loadCalendar();


    document

.getElementById(
"minusPeople"
)

.onclick = ()=>{


  if(people > 1){

    people--;

    updatePeople();

  }


};



document

.getElementById(
"plusPeople"
)

.onclick = ()=>{


  if(people < 10){

    people++;

    updatePeople();

  }


};


    document

      .getElementById("reserveButton")

      .addEventListener(

        "click",

        sendReservation

      );


  }

);



//==================================================
// 料金取得
//==================================================

async function loadPrices(){


  const res =
    await fetch(
      API_URL + "/api/prices"
    );


  const data =
    await res.json();



  if(data.length){


    unitPrice =
      Number(
        data[0].price
      );


  }

}



//==================================================
// カレンダー取得
//==================================================

async function loadCalendar(){


  const res =
    await fetch(
      API_URL + "/api/calendar"
    );


  calendarData =
    await res.json();



  renderCalendar();



  document

    .getElementById("prevMonth")

    .onclick = ()=>{


      currentMonth.setMonth(

        currentMonth.getMonth() - 1

      );


      renderCalendar();


    };



  document

    .getElementById("nextMonth")

    .onclick = ()=>{


      currentMonth.setMonth(

        currentMonth.getMonth() + 1

      );


      renderCalendar();


    };


}



//==================================================
// カレンダー表示
//==================================================

function renderCalendar(){


  const area =
    document.getElementById(
      "calendar"
    );


  area.innerHTML="";



  const title =
    document.getElementById(
      "calendarTitle"
    );



  title.textContent =

    currentMonth.getFullYear()

    + "年"

    +

    (

      currentMonth.getMonth()+1

    )

    + "月";



  // ボタン制御

  document

    .getElementById(
      "prevMonth"
    )

    .disabled =

      currentMonth <= minMonth;



  document

    .getElementById(
      "nextMonth"
    )

    .disabled =

      currentMonth >= maxMonth;




  const week =

    [
      "日",
      "月",
      "火",
      "水",
      "木",
      "金",
      "土"
    ];



  week.forEach(day=>{


    const div =
      document.createElement(
        "div"
      );


    div.textContent =
      day;


    div.className =
      "calendar-week";


    area.appendChild(
      div
    );


  });



  const firstDay =

    new Date(

      currentMonth.getFullYear(),

      currentMonth.getMonth(),

      1

    ).getDay();



  const lastDate =

    new Date(

      currentMonth.getFullYear(),

      currentMonth.getMonth()+1,

      0

    ).getDate();




  // 空白

  for(
    let i=0;
    i<firstDay;
    i++
  ){

    area.appendChild(

      document.createElement(
        "div"
      )

    );

  }




  // 日付

  for(
    let d=1;
    d<=lastDate;
    d++
  ){


    const dateText =

      currentMonth.getFullYear()

      +

      "-"

      +

      String(
        currentMonth.getMonth()+1
      )
      .padStart(2,"0")

      +

      "-"

      +

      String(d)
      .padStart(2,"0");



    const day =

      calendarData.find(

        x =>
          x.date === dateText

      );



    const button =

      document.createElement(
        "button"
      );



    button.textContent =
      d;



    button.type =
      "button";



    button.className =

      day && day.available

      ?

      "calendar-day"

      :

      "calendar-day disabled";




    if(day && day.available){


      button.onclick = ()=>{


        selectedDate =
          dateText;



        document

          .getElementById(
            "useDate"
          )

          .value =
          dateText;

        document
          .getElementById(
          "selectedDateText"
        )
        .textContent =
        
          "利用日：" +
          dateText;

        document

          .querySelectorAll(
            ".calendar-day"
          )

          .forEach(btn=>{


            btn.classList.remove(
              "selected"
            );


          });



        button.classList.add(
          "selected"
        );


      };


    }



    area.appendChild(
      button
    );


  }


}

//==================================================
// 人数更新
//==================================================
function updatePeople(){


  document

  .getElementById(
    "peopleDisplay"
  )

  .textContent =
    people;



  document

  .getElementById(
    "people"
  )

  .value =
    people;



  updatePrice();


}

//==================================================
// 金額表示
//==================================================

function updatePrice(){


  const people =

    Number(

      document

      .getElementById(
        "people"
      )

      .value

    );



  const total =

    people *

    unitPrice;



  document

    .getElementById(
      "totalPrice"
    )

    .textContent =


      total.toLocaleString()

      +

      "円";


}



//==================================================
// 予約送信
//==================================================

async function sendReservation(){


  if(!selectedDate){


    alert(
      "利用日を選択してください"
    );


    return;


  }

  // 名前チェック

const name =
  document.getElementById(
    "name"
  ).value.trim();


if(!name){

  alert(
    "お名前を入力してください"
  );

  return;

}



// 電話番号チェック

const phone =
  document.getElementById(
    "phone"
  ).value.trim();


if(!phone){

  alert(
    "電話番号を入力してください"
  );

  return;

}



if(
  !/^[0-9\-]+$/.test(phone)
){

  alert(
    "電話番号の形式を確認してください"
  );

  return;

}



// メールチェック（入力時のみ）

const mail =
  document.getElementById(
    "mail"
  ).value.trim();



if(
  mail &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)
){

  alert(
    "メールアドレスの形式を確認してください"
  );

  return;

}

  const body = {


    useDate:selectedDate,


    company:

      document.getElementById(
        "company"
      ).value,


    name:

      document.getElementById(
        "name"
      ).value,


    phone:

      document.getElementById(
        "phone"
      ).value,


    mail:

      document.getElementById(
        "mail"
      ).value,


    people:

      document.getElementById(
        "people"
      ).value,


    memo:

      document.getElementById(
        "memo"
      ).value


  };



  const res =

    await fetch(

      API_URL +

      "/api/reservation",

      {

        method:"POST",

        headers:{

          "Content-Type":

          "application/json"

        },

        body:

          JSON.stringify(body)

      }

    );



  const data =

    await res.json();



  if(data.success){


  localStorage.setItem(
    "reservationResult",
    JSON.stringify({
      reservationNo:data.reservationNo,
      useDate:selectedDate,
      people:people,
      totalPrice:data.totalPrice
    })
  );


  location.href =
    "reservation-complete.html";


}
else{


  alert(
    data.message
  );


}