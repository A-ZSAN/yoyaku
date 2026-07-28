//==================================================
// 温泉予約システム
// 予約管理カレンダー
//==================================================


let reservations = [];

let currentMonth = new Date();

currentMonth.setDate(1);


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


  await loadReservations();


  document
  .getElementById(
    "prevMonth"
  )
  .onclick = ()=>{

    currentMonth.setMonth(

      currentMonth.getMonth() - 1

    );

    renderCalendar();

  };


  document
  .getElementById(
    "nextMonth"
  )
  .onclick = ()=>{

    currentMonth.setMonth(

      currentMonth.getMonth() + 1

    );

    renderCalendar();

  };

  document
  .getElementById(
    "closeModal"
  )
  .onclick =
    closeReservationModal;


}

);




//==================================================
// 予約取得
//==================================================

async function loadReservations(){


  const res =

    await fetch(

      API_URL +

      "/api/reservations"

    );


  reservations =

    await res.json();



  renderCalendar();


}



//==================================================
// カレンダー表示
//==================================================

function renderCalendar(){


const area =

document.getElementById(

"reservationCalendar"

);


area.innerHTML = "";



document

.getElementById(

"calendarTitle"

)

.textContent =


currentMonth.getFullYear()

+

"年"

+

(

currentMonth.getMonth()+1

)

+

"月";




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




const week = [

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


div.textContent = day;


div.className =

"calendar-week";


area.appendChild(div);


});





const firstDay =

new Date(

currentMonth.getFullYear(),

currentMonth.getMonth(),

1

)

.getDay();



const lastDate =

new Date(

currentMonth.getFullYear(),

currentMonth.getMonth()+1,

0

)

.getDate();




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





const button =

document.createElement(

"button"

);


button.type="button";


button.textContent=d;



button.className=

"calendar-day";




// 予約確認

const reservation =

reservations.find(

r=>

r.useDate === dateText

);





if(reservation){


button.classList.add(

"has-reservation"

);


button.textContent =

d +

"●";


}





button.onclick = ()=>{


showReservation(

dateText

);


};



area.appendChild(

button

);



}



}





//==================================================
// 予約詳細表示
//==================================================

function showReservation(date){

  const reservation =

    reservations.find(

      r => r.useDate === date

    );


  const modal =

    document.getElementById(

      "reservationModal"

    );


  const body =

    document.getElementById(

      "modalBody"

    );


  if(!reservation){

    body.innerHTML = `

      <h2 class="modal-title">

        ${date}

      </h2>

      <p>

        この日の予約はありません。

      </p>

      <div class="modal-buttons">

        <button

          class="close-btn"

          onclick="closeReservationModal()"

        >

          閉じる

        </button>

      </div>

    `;


    modal.style.display = "block";

    return;

  }


  body.innerHTML = `

    <h2 class="modal-title">

      予約詳細

    </h2>


    <div class="modal-row">

      <span class="modal-label">

        予約番号

      </span>

      <div class="modal-value">

        ${reservation.reservationNo}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        利用日

      </span>

      <div class="modal-value">

        ${reservation.useDate}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        会社名

      </span>

      <div class="modal-value">

        ${reservation.company || "-"}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        お名前

      </span>

      <div class="modal-value">

        ${reservation.name}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        電話番号

      </span>

      <div class="modal-value">

        ${reservation.phone}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        メール

      </span>

      <div class="modal-value">

        ${reservation.mail || "-"}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        人数

      </span>

      <div class="modal-value">

        ${reservation.people} 名

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        金額

      </span>

      <div class="modal-value">

        ${Number(
          reservation.totalPrice
        ).toLocaleString()} 円

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        備考

      </span>

      <div class="modal-value">

        ${reservation.memo || "-"}

      </div>

    </div>


    <div class="modal-row">

      <span class="modal-label">

        状態

      </span>

      <select id="statusSelect">

        <option value="予約"

          ${reservation.status==="予約"?"selected":""}>

          予約

        </option>

        <option value="来館済"

          ${reservation.status==="来館済"?"selected":""}>

          来館済

        </option>

        <option value="キャンセル"

          ${reservation.status==="キャンセル"?"selected":""}>

          キャンセル

        </option>

      </select>

    </div>


    <div class="modal-buttons">

      <button

        class="save-btn"

        onclick="saveReservationStatus('${reservation.reservationNo}')"

      >

        保存

      </button>


      <button

        class="close-btn"

        onclick="closeReservationModal()"

      >

        閉じる

      </button>

    </div>

  `;


  modal.style.display = "block";

}

//==================================================
// モーダル閉じる
//==================================================

function closeReservationModal(){

  document
    .getElementById(
      "reservationModal"
    )
    .style.display = "none";

}



//==================================================
// 状態保存
//==================================================

async function saveReservationStatus(

  reservationNo

){

  const status =

    document
      .getElementById(
        "statusSelect"
      )
      .value;


  await updateStatus(

    reservationNo,

    status

  );


  closeReservationModal();

  await loadReservations();

}