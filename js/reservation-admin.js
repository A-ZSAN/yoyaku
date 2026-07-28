//==================================================
// 温泉予約システム
// 予約管理画面
//==================================================


//==================================================
// 初期処理
//==================================================

document.addEventListener(

  "DOMContentLoaded",

  ()=>{

    loadReservations();

  }

);



//==================================================
// 予約一覧取得
//==================================================

async function loadReservations(){


  const area =

    document.getElementById(

      "reservationList"

    );



  try{


    const res =

      await fetch(

        API_URL +

        "/api/reservations"

      );



    const data =

      await res.json();



    if(!Array.isArray(data)){


      area.textContent =

        "予約データがありません";


      return;


    }



    renderReservations(

      data

    );


  }


  catch(e){


    console.error(e);


    area.textContent =

      "取得エラー";


  }


}



//==================================================
// 一覧表示
//==================================================

function renderReservations(list){


  const area =

    document.getElementById(

      "reservationList"

    );


  area.innerHTML = "";



  list.forEach(reservation=>{


    const card =

      document.createElement(

        "div"

      );


    card.className =

      "reservation-card";



    card.innerHTML = `

      <h3>

        ${reservation.reservationNo}

      </h3>


      <p>

        利用日：

        ${reservation.useDate}

      </p>


      <p>

        名前：

        ${reservation.name}

      </p>


      <p>

        電話：

        ${reservation.phone}

      </p>


      <p>

        人数：

        ${reservation.people}名

      </p>


      <p>

        金額：

        ${Number(

          reservation.totalPrice

        ).toLocaleString()}

        円

      </p>



      <p>

        備考：

        ${reservation.memo || ""}

      </p>



      <label>

        状態：

        <select

          onchange="updateStatus(

            '${reservation.reservationNo}',

            this.value

          )"

        >

          <option

            value="予約"

            ${reservation.status==="予約"?"selected":""}

          >

            予約

          </option>


          <option

            value="来館済"

            ${reservation.status==="来館済"?"selected":""}

          >

            来館済

          </option>


          <option

            value="キャンセル"

            ${reservation.status==="キャンセル"?"selected":""}

          >

            キャンセル

          </option>


        </select>


      </label>


    `;


    area.appendChild(

      card

    );


  });


}



//==================================================
// 状態変更
//==================================================

async function updateStatus(

  reservationNo,

  status

){



  const res =

    await fetch(

      API_URL +

      "/api/reservation/update",

      {


        method:"POST",


        headers:{


          "Content-Type":

          "application/json"


        },


        body:

          JSON.stringify({

            reservationNo:

              reservationNo,


            status:

              status

          })


      }

    );



  const data =

    await res.json();



  if(data.success){


    alert(

      "更新しました"

    );


  }

  else{


    alert(

      data.message

    );


  }


}