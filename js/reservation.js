//==================================================
// 温泉予約システム
// 予約画面
//==================================================


// 現在料金

let unitPrice = 0;


// 選択日

let selectedDate = null;



//==================================================
// 初期処理
//==================================================

document.addEventListener(

  "DOMContentLoaded",

  async()=>{


    await loadPrices();

    await loadCalendar();


    document

      .getElementById("people")

      .addEventListener(

        "change",

        updatePrice

      );


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


  const res = await fetch(

    API_URL +

    "/api/prices"

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


  const res = await fetch(

    API_URL +

    "/api/calendar"

  );


  const data =

    await res.json();


  createCalendar(

    data

  );


}



//==================================================
// カレンダー作成
//==================================================

function createCalendar(data){


  const area =

    document.getElementById(

      "calendar"

    );


  area.innerHTML="";



  data.forEach(day=>{


    const button =

      document.createElement(

        "button"

      );



    button.textContent =

      day.available

      ?

      day.date.slice(8)+"日"

      :

      "×";



    button.className =

      day.available

      ?

      "calendar-day"

      :

      "calendar-day disabled";



    if(day.available){


      button.onclick = ()=>{


        selectedDate =

          day.date;


        document

          .getElementById(

            "useDate"

          )

          .value =

          day.date;



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


  });


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


  const body = {


    useDate:

      selectedDate,


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



  const res = await fetch(

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


    alert(

      "予約しました\n予約番号："+

      data.reservationNo

    );


    location.href="index.html";


  }

  else{


    alert(

      data.message

    );


  }


}