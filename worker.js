//==================================================
// 温泉予約システム Ver.0.1
// Cloudflare Worker
//==================================================


export default {


async fetch(request, env){


  // CORS

  if(request.method === "OPTIONS"){

    return cors();

  }



  const url =
    new URL(request.url);


  const path =
    url.pathname;



  try{


    switch(path){



      // TOP情報

      case "/api/site":

        return gasGet(

          env,

          "getSite"

        );



      // お知らせ

      case "/api/news":

        return gasGet(

          env,

          "getNews"

        );



      // 料金

      case "/api/prices":

        return gasGet(

          env,

          "getPrices"

        );



      // カレンダー

      case "/api/calendar":

  return json({

    test:true,

    gas:env.GAS_URL

  });



      // 予約登録

      case "/api/reservation":


        if(request.method !== "POST"){

          return json({

            success:false,

            message:"Method Not Allowed"

          },405);

        }


        return gasPost(

          request,

          env,

          "saveReservation"

        );



      default:


        return json({

          success:false,

          message:"Not Found"

        },404);



    }


  }

  catch(error){


    return json({

      success:false,

      message:error.message

    },500);


  }


}

};



//==================================================
// GAS GET
//==================================================


async function gasGet(

  env,

  action

){


  const res = await fetch(

    env.GAS_URL +

    "?action=" +

    action

  );


  const text =

    await res.text();


  return new Response(

    text,

    {

      status:200,

      headers:{

        "Content-Type":

          "application/json",

        "Access-Control-Allow-Origin":

          "*"

      }

    }

  );


}



//==================================================
// GAS POST
//==================================================


async function gasPost(

  request,

  env,

  action

){


  const body =

    await request.json();



  body.action = action;



  const res = await fetch(

    env.GAS_URL,

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



  return json(data);


}



//==================================================
// JSON
//==================================================


function json(

  data,

  status=200

){


  return new Response(

    JSON.stringify(data),

    {

      status,

      headers:{

        "Content-Type":

          "application/json;charset=UTF-8",


        "Access-Control-Allow-Origin":

          "*",


        "Access-Control-Allow-Methods":

          "GET,POST,OPTIONS",


        "Access-Control-Allow-Headers":

          "Content-Type"

      }

    }

  );


}



//==================================================
// CORS
//==================================================


function cors(){


  return new Response(

    null,

    {

      status:204,

      headers:{

        "Access-Control-Allow-Origin":"*",


        "Access-Control-Allow-Methods":

          "GET,POST,OPTIONS",


        "Access-Control-Allow-Headers":

          "Content-Type"

      }

    }

  );


}