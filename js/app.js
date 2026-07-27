//==================================================
// 温泉予約システム
// TOPページ処理
//==================================================


//==================================================
// 初期処理
//==================================================

document.addEventListener(

  "DOMContentLoaded",

  () => {

    loadSite();

    loadNews();

    loadPrices();

  }

);



//==================================================
// 施設情報取得
//==================================================

async function loadSite(){

  try{

    const res = await fetch(

      API_URL +

      "/api/site"

    );


    const data =

      await res.json();


    if(!data.success){

      throw new Error(
        data.message
      );

    }


    // 施設名

    if(data.facilityName){

      document
        .getElementById(
          "facilityName"
        )
        .textContent =
          data.facilityName;

    }


    // 説明

    if(data.description){

      document
        .getElementById(
          "description"
        )
        .textContent =
          data.description;

    }


    // 画像

    if(data.image){

      document
        .getElementById(
          "heroImage"
        )
        .src =
          data.image;

    }


  }
  catch(error){

    console.error(

      "施設情報取得エラー",

      error

    );

  }

}



//==================================================
// お知らせ取得
//==================================================

async function loadNews(){

  try{

    const res = await fetch(

      API_URL +

      "/api/news"

    );


    const data =

      await res.json();


    const area =

      document.getElementById(
        "news"
      );


    area.innerHTML="";


    if(

      !data ||

      !data.length

    ){

      area.textContent =
        "現在お知らせはありません";

      return;

    }


    data.forEach(item=>{


      const div =

        document.createElement(
          "div"
        );


      div.className =
        "news-item";


      div.innerHTML = `

        <div>
          ${item.date || ""}
        </div>

        <div>
          ${item.text || ""}
        </div>

      `;


      area.appendChild(div);


    });


  }
  catch(error){

    console.error(

      "お知らせ取得エラー",

      error

    );

  }

}



//==================================================
// 料金取得
//==================================================

async function loadPrices(){

  try{


    const res = await fetch(

      API_URL +

      "/api/prices"

    );


    const data =

      await res.json();


    const area =

      document.getElementById(
        "prices"
      );


    area.innerHTML="";


    if(

      !data ||

      !data.length

    ){

      area.textContent =
        "料金設定がありません";

      return;

    }


    data.forEach(price=>{


      const div =

        document.createElement(
          "div"
        );


      div.className =
        "price-item";


      div.textContent =

        price.name +

        "　" +

        Number(price.price)
          .toLocaleString() +

        "円";


      area.appendChild(div);


    });


  }
  catch(error){

    console.error(

      "料金取得エラー",

      error

    );

  }

}