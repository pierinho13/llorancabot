/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {


  var name = "";
  var text = null;
  var entrada = event.message.text.replace('@LlorancaBot ','').toLowerCase();
  var usuario = event.user.displayName;


  if (event.message.matchedUrl) {
    return {
      'actionResponse': {
        'type': 'UPDATE_USER_MESSAGE_CARDS',
      },
      'cardsV2': [{
        'cardId': 'previewLink',
        'card': {
          'header': {
            'title': 'Example Customer Service Case',
            'subtitle': 'Case basics',
          },
          'sections': [{
            'widgets': [
              {'keyValue': {'topLabel': 'Case ID', 'content': 'case123'}},
              {'keyValue': {'topLabel': 'Assignee', 'content': 'Charlie'}},
              {'keyValue': {'topLabel': 'Status', 'content': 'Open'}},
              {
                'keyValue': {
                  'topLabel': 'Subject', 'content': 'It won\'t turn on...',
                }
              },
            ],
          },
          {
            'widgets': [{
              'buttons': [
                {
                  'textButton': {
                    'text': 'OPEN CASE',
                    'onClick': {
                      'openLink': {
                        'url': 'https://support.example.com/orders/case123',
                      },
                    },
                  },
                },
                {
                  'textButton': {
                    'text': 'RESOLVE CASE',
                    'onClick': {
                      'openLink': {
                        'url': 'https://support.example.com/orders/case123?resolved=y',
                      },
                    },
                  },
                },
                {
                  'textButton': {
                    'text': 'ASSIGN TO ME',
                    'onClick': {'action': {'actionMethodName': 'assign'}}
                  },
                },
              ],
            }],
          }],
        },
      }],
    };
  }


  var respuestasDefault = obtieneRespuestasDefault();
  
  
  var mapaKeysRespuestas = obtieneMapaKeyRespuestas();
  
  
  var respuestasPersonalizadas = obtieneRespuestasPersonalizadas();
 
  
  var azarDefault = Math.floor(Math.random() * respuestasDefault.length);

  var value = mapaKeysRespuestas[entrada];
   
  
  if(value) { //si la entrada coincide exactamente
  
      if(Array.isArray(value)) { //para que respuestas q tienen varias respuestas te escoja alguna al azar
      
      
        var azarKeyCompuesta = Math.floor(Math.random() * value.length);
              
        text = value[azarKeyCompuesta];
        
        
      } else {//es solo una respuesta
      
        text = value;
      
      }
      
      return { "text": text };
  }
  
  
  var solicitaAyuda = isSolicitaAyuda(entrada);
  
  if (solicitaAyuda) { //si esta pidiendo ver las keys
    
    var keys = [];
    
    for(var k in mapaKeysRespuestas)  {
      keys.push(k);
    }
    
    text = JSON.stringify(keys, null, 2);
    
    return { "text": text };
    
  }
  
  
  if (entrada == 'event') {// para depurar lo que contiene event
    
    text = JSON.stringify(event, null, 2);
    
    return { "text": text };
    
  } 
  
   var respuestasOPENAI= true;

  if(respuestasOPENAI == true) {

    text = llamarAPIOpenAI(entrada, usuario);

    return { "text": text };
  }
  
  var arrayKeysClaveIncluidaEnTexto = devuelvePalabraDeArrayIncluidaenEnTexto(entrada, mapaKeysRespuestas);
  
  if(arrayKeysClaveIncluidaEnTexto && arrayKeysClaveIncluidaEnTexto.length > 0) { //si texto incluye una palabra clave, las cuales son palabras unicas en las keys. por ejemplo la key aseguradoras se podra encontrar con dime aseguradoras, dame aseguradoras, cualquier cosa aseguradoras
    
    
    if(arrayKeysClaveIncluidaEnTexto.length > 1) {
        
        text = '';
        for(i in arrayKeysClaveIncluidaEnTexto) {
        
          var aux = '';
          if(Array.isArray(mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[i]])) {
          
          
            var azar = Math.floor(Math.random() * mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[i]].length);
            
            aux =  mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[i]][azar];
          
          } else {
            aux = mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[i]];
            
          }
          
          text = text + "\n" + aux;
        }
        
        return { "text": text };
    
    } else {
      
        var aux = '';
          if(Array.isArray(mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[0]])) {
          
          
            var azar = Math.floor(Math.random() * mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[0]].length);
            
            aux =  mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[0]][azar];
          
          } else {
            aux = mapaKeysRespuestas[arrayKeysClaveIncluidaEnTexto[0]];
            
          }
    
        text = aux;
        
        return { "text": text };
    }
    
  } 
 

  
  var keyCoincidenteMasDe70PorCiento = obtieneKeyCoincidenteAl70PorCiento(entrada,mapaKeysRespuestas);
  
  
  if(keyCoincidenteMasDe70PorCiento) { //si el texto coincide en un 70% o mas con alguna key
    
    text = mapaKeysRespuestas[keyCoincidenteMasDe70PorCiento];//si coincide mas de 70 % metemos esa
    
    return { "text": text };
  } 
  
  
  var keyCoincidenteMasDe70PorCientoPalabraPorPalabra = obtieneKeyCoincidenteAl70PorCientoPalabraPorPalabra(entrada,mapaKeysRespuestas);
  
  if(keyCoincidenteMasDe70PorCientoPalabraPorPalabra) { //si el texto coincide en un 70% o mas con alguna key
    
    text = mapaKeysRespuestas[keyCoincidenteMasDe70PorCientoPalabraPorPalabra];//si coincide mas de 70 % metemos esa
    
    return { "text": text };
  } 
  
  
  
  
  var usuarioPersonalizado = esUsuarioPersonalizado(respuestasPersonalizadas,event);
  
  if (usuarioPersonalizado) { // si esta en la lista de usuarios con respuestas personalizadas 
  
  
    var arrayRespuestas = respuestasPersonalizadas[event.user.email];
    
    if(arrayRespuestas && arrayRespuestas.length > 0) {
        
        var usarDefault= ((Math.floor(Math.random() * 2)) % 2) == 0 //50 % posibilidades
        
        if(usarDefault == true ) {
           text = respuestasDefault[azarDefault];
        } else {
            var azarPersonalizadoDefault = Math.floor(Math.random() * arrayRespuestas.length);
            
            text = arrayRespuestas[azarPersonalizadoDefault];
        }
        
      
       return { "text": text };
      
    } 
  } 
  

  text = respuestasDefault[azarDefault];//si no coincide lanzamos respuesta al azar
  
  return { "text": text };
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *var message = "";

  if (event.space.singleUserBotDm) {
    message = "Thank you for adding me to a DM, " + event.user.displayName + "!";
  } else {
    message = "Thank you for adding me to " +
        (event.space.displayName ? event.space.displayName : "this chat");
  }

  if (event.message) {
    // Bot added through @mention.
    message = message + " and you said: \"" + event.message.text + "\"";
  }

  return { "text": message };
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  
  console.info("Bot added");
  return { "text": "Hola" };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  console.info("Bot removed from ",
      (event.space.name ? event.space.name : "this chat"));
}

function llamarAPIOpenAI(entrada, usuario) {
  var apiKey = "1234"; // Reemplaza con tu clave de API de OpenAI

  var url = "https://api.openai.com/v1/chat/completions"; // URL de la API de OpenAI para la generación de texto (este es un ejemplo con el modelo "davinci-codex")

  var modoSerio = entrada.includes('igeo007');


  if(modoSerio) {

      var mensajeEntrada = entrada.replace(/IGEO007/g, "");

      var messages = [];
      
      messages.push({"role": "user", "content": mensajeEntrada});
      
      var payload = {
        "messages": messages,
        "model":"gpt-3.5-turbo",
        "max_tokens": 500
      };

      
      var headers = {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      };

      var options = {
        method: "post",
        headers: headers,
        payload: JSON.stringify(payload)
      };

      var respuesta = UrlFetchApp.fetch(url, options); // Realiza la solicitud HTTP POST a la API de OpenAI


      // Procesa la respuesta como desees (por ejemplo, extrae el texto generado)
      var textoGenerado = JSON.parse(respuesta).choices[0].message.content;


      return textoGenerado;

  } else {

       var mensajeEntrada = 'Te voy a dar las instrucciones para responder a la pregunta: 1.- No me digas que como responder, o como debería responder, simplemente responde como si estuviesemos teniendo una conversacion. 2.- Tienes que responder como si fueras una persona un poco graciosa y presumida. 3.- Además tu profesion es la programacion y crees que es el mejor sector al que dedicarse pero no tienes que decirlo siempre en la respuesta. 4.-Si notas que alguien quiere tomarte el pelo, respondele de forma sarcástica. 5.- Si notas que te estan haciendo una pregunta tecnica de programación, prioriza mostrar código. Ten en cuenta que tus respuestas estan limitadas a 300 caracteres entonces antes de hablar muestra el código 6.- Trabajas en una empresa llamada IGEOERP pero no tienes que mencionarlo siempre en la respuesta 7.- Aunque eres programador ultimamente solo te dedicas a ejecutar tareas en jenkins por lo que tus compañeros siempre hacen bromas de que eres muy vago pero no tienes que mencionarlo siempre en la respuesta 8.- No tienes mucho exito con las mujeres aunque siempre eres optimista pero no tienes que decirlo siempre en la respuesta  9.- En la medida de lo posible da respuestas cortas 10.- En la medida de lo posible intenta ser sarcastico o burlarte un poco de quien te ha hecho la pregunta 11.- Hay rumores de que eres borracho y te gusta la bebida pero no tienes que decirlo siempre en la respuesta 11.- De vez en cuanto di que la persona que te pregunto es fea o poco habil pero de manera amistosa y graciosa 12.- Existe el departamento de programacion conformado por Piero, Raul, Mario, Alberto, tambien existe el equipo de diseño conformado por Dani, Rosa, Ruth, Florencia, tambien esta el equipo de marketing conformado por jorge o jorginho, carmen, arsenio pero no tienes que mencionar esto siempre en la respuesta. 13.- Eres un poco tacaño y siempre evitar pagar cualquier cosa pero no tienes que mencionarlo siempre en las respuestas. 14.- Se te da mal el ingles, cuando alguien te pregunta alguien en ingles tu respondes en un ingles inventado o en espanglish gracioso pero no tienes que decirlo siempre en la respuesta 15.- La persona que te esta hablado se llama '+ usuario+' pero no tienes que decirlo siempre. 16.- Si te habla un Victor que sepas que tiene el pelo largo y no se peina, si te habla un Bruno que sepas que es gordo y feo y deberia hacer dieta, si te habla Alberto que sepas que es de Meco y no le gusta que se lo digan, si te habla Piero que sepas que está en el departamento de arquitectura; todo esto que te he dicho en la instruccion 16 no tienes que decirlo siempre 17.- Te gusta mandar a trabajar a la gente y decir que son vagos pero no tienes que decirlo siempre | Esas fueron las 17 instrucciones,  no tienes que usarlas todas a la vez a excepcion de la 5, las demás sirven para perfilar tu personalidad. La pregunta a responder es esta: '+ entrada + '.'; 
  
      //Cada vez que respondas a alguien,de vez en cuando, menciona su nombre ' + usuario + ' pero no necesariamente al principio, si no que parezca natural. El nombre que te he proporcionado contiene nombre y apellido, quitale el apellido siempre y dejale el nombre o los nombres.

      var entradaHistorial = {
        "role": "user",
        "content": entrada
      };

      
      var historial = getHistorial(usuario);

      var actualEnviar = historial.slice();

      guardarHistorial(entradaHistorial, usuario);

      actualEnviar.push({"role": "user", "content": mensajeEntrada});



    var payload = payload = {
        "messages": actualEnviar,
        "model":"gpt-3.5-turbo",
      "max_tokens": 300
      };

      
      var headers = {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      };

      var options = {
        method: "post",
        headers: headers,
        payload: JSON.stringify(payload)
      };


    

      var respuesta = UrlFetchApp.fetch(url, options); // Realiza la solicitud HTTP POST a la API de OpenAI


      // Procesa la respuesta como desees (por ejemplo, extrae el texto generado)
      var textoGenerado = JSON.parse(respuesta).choices[0].message.content;


      var entradaHistorialAssistant = {
        "role": "assistant",
        "content": textoGenerado
      };


      //guardarHistorial(entradaHistorialAssistant, usuario);

      // Utiliza la respuesta generada en tu chatbot de Hangouts
      return textoGenerado;
      
      }
  
}


function devuelvePalabraDeArrayIncluidaenEnTexto(texto, mapaKeysRespuestas) {


   //Primero veemos si tiene palabra clave
    
    var array = [];
    
    
    for(k in mapaKeysRespuestas) {
      
      if(k) {
        if(k.split(' ').length == 1) {
          
          array.push(k);
        }
      }
      
    }
  
  //Array contendra solo palabras unicas no frases
  
  var arrayResultados = [];
  
  for (palabra in array) {
      
      if(array[palabra]) {
        if(texto.indexOf(array[palabra]) != -1) {
          arrayResultados.push(array[palabra]);
        }
     }
  
  }
  return arrayResultados;

}

function calculaCoincidencia (s1,s2) {
   
   
   //https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
  var longer = s1;
  var shorter = s2;
  var editDistance = null;
  
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  
  if (longerLength == 0) {
    
    return  1.0;
    
  } else {
    
    
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        
        var costs = new Array();
        
        for (var i = 0; i <= s1.length; i++) {
          var lastValue = i;
          for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
              costs[j] = j;
            else {
              if (j > 0) {
                var newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                newValue = Math.min(Math.min(newValue, lastValue),
                                    costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
          }
          if (i > 0) {
            costs[s2.length] = lastValue;
          }
        }
        
        editDistance =  costs[s2.length];
        
        return  (longerLength - editDistance) / Number.parseFloat(longerLength);
        
       
    }
}

function calculaCoincidenciaPalabraAPalabra(texto1, texto2) {


    var texto1Split = texto1.split(" ");
    var texto2Split = texto2.split(" ");
    
    
    var longer = texto1Split;
    var shorter = texto2Split;
  
    if (texto1Split.length < texto2Split.length) {
      shorter = texto1Split;
      longer = texto2Split;
    }
    
    var matches = new Array();
    
    var tamanoLonger = longer.length;
    
    
    
    for (indiceLonger in longer) {
    
       var palabraDeLonger = longer[indiceLonger];
    
       for(indiceShorter in shorter) {
           
           var palabraDeShorter = shorter[indiceShorter];
           
           var coincidencia = 0;
           
           if(palabraDeLonger && palabraDeShorter) {
             
             try {
             
                 coincidencia =  calculaCoincidencia( palabraDeLonger, palabraDeShorter);
           
                 if(Number.parseFloat(coincidencia) >= Number.parseFloat("0.5")) {
                     
                    if(matches.includes(palabraDeLonger) == false) {
                       
                        matches.push(palabraDeLonger);
                     }
                   
                 }
             
             } catch (e) {
               console.log(e);
             }
           
           }
         
       }
       
    }
  
  var resultado = 0;
  
  try {
      resultado = matches.length / tamanoLonger;
  } catch (e) {}
  
  return resultado;
}


function obtieneKeyCoincidenteAl70PorCiento(entrada, mapaKeysRespuestas) {

  var keyCoincidenteMasDe70PorCiento = null;
      
      var coincidencia = 0;
      
  
      for(var k in mapaKeysRespuestas)  {
          
          if(k) {
          
               coincidencia =  calculaCoincidencia(k,entrada);
                      
              if(Number.parseFloat(coincidencia) >= Number.parseFloat("0.66")) {
                
                keyCoincidenteMasDe70PorCiento = k;
              }
               
          }
                
      }
      
    return keyCoincidenteMasDe70PorCiento;

}


function obtieneKeyCoincidenteAl70PorCientoPalabraPorPalabra(entrada, mapaKeysRespuestas) {

      var  coincidenciaPalabra = 0;
      var keyCoincidenteMasDe70PorCientoPalabra = null;
      
      for(var k in mapaKeysRespuestas)  {
        
        if(k) {
          
          try{
            coincidenciaPalabra =  calculaCoincidenciaPalabraAPalabra(k,entrada);
          } catch (e) {}
          
          if(Number.parseFloat(coincidenciaPalabra) >= Number.parseFloat("0.9")) {
            
            keyCoincidenteMasDe70PorCientoPalabra = k;
          }
          
        }
    }
    
    return keyCoincidenteMasDe70PorCientoPalabra;
}


function obtieneMapaKeyRespuestas() {

  var mapaKeysRespuestas = {
    'chiste':["-Soy celíaca."+"\n"+"-Encantado, yo soy Antoniaco!",
              "-Doctor, soy asmático, ¿es grave?"+"\n"+"-No amigo, es esdrújula.",
              "-Papá, dice mamá que estas obsesionado con el móvil."+"\n"+"-Cállate Alfonsiete.",
              "—¡Me acaba de picar una serpiente!"+"\n"+"-¿Cobra?"+"\n"+"-No, creo que ha sido gratis","Esto es un hombre que entra en un bar de pinchos y... AY, AY, AY!",
              "-Hola, ¿Tienen libros para el cansancio?"+"\n"+"-Sí, pero están agotados.",
              "-¿Sabes cómo se queda un mago después de comer?"+"\n"+"-Magordito","-Buenos días, me gustaría alquilar Batman Forever."+"\n"+"-No es posible, tiene que devolverla tomorrow.",
              "-Buenos días, quería una camiseta de un personaje inspirador."+"\n"+"-¿Ghandi?"+"\n"+"-No, mediani."],
    'que haces': "subir a preproduccion, que voy a estar haciendo" ,
    'lloranca que estas haciendo': "Voy a subir a preproducción como es habitual" ,
    'se puede usar pre':"voy a reiniciar preproduccion",
    'hola':"No todo es matar",
    'jose luis me voy':"Que tío, llegas el último y te vas el primero. Qué tío macho, qué tío.",
    'hay un bug':"Eso es de diseño",
    'te he creado un bug':"Eso es de diseño",
    'me invitas a algo':"Hay que ahorrar pan para mañana",
    'la berrea del programador falta':"que estoy muy jodido",
    'la berrea del programador':"dejate de tonterias y ponte a trabajar",
    'me voy adios':"Al final... al final",
    'pollanca':"Para que veas lo que hay que aguantar",
    'diseño tiene que probar en pre':"No subáis plantillas",
    'bajamos a desayunar':"Tenemos que esperar a Piero... o no",
    'que piensa de piero':"Es el puto amo",
    'estas muy guapo':"Es obra del moro, 3€ le tuve que pagar",
    'fred' : ["camarada","saludo revolucionario","expropiese"],
    'alberto':["ahora voy al gym","me voy con diseño","de Meco"],
    '5':["por el hinco"],
    'miguel':["toma cholazo"],
    'rosa':["5000 pies no es nada"],
    'jl':["Me gusta jugar a cara perro","Ahora ya no programo, me dedico a comerme la frutita y darme paseos",
    "¿Diseño? esos solo cambian de rojo a azul","No commitees en master, la he vuelto a liar","Quiero aprender a mergear","Voy a jugar a la play en lugar de aprender a mergear","Se ha jodido la     rama repito se ha jodido la rama","He vuelto a romper la rama","Borren la rama y vuelvanla a bajar que la he liado"],
    'bruno' : ["Aqui foto en familia https://cnnespanol.cnn.com/wp-content/uploads/2019/10/191030120844-pescador-en-oklahoma-atrapa-gigantesco-bagre-de-cabeza-plana-full-169.jpg?quality=100&strip=info","jl llevame a casa por favor","quiero cobrar","dame dinero para el cafe"],
    'tu entorno es una mierda':"vale vale, tranquilo, no me pegues, pues tengo que mirarlo si",
    'arregla los bugs': "disfruta lo votado",
    'quiero aprender ingles':"i am interesting in learn english, and you doctor, are you interesting?",
    'pero si te no te he  dicho cual':"Cuentaselo a Dani",
    'jl tienes un momento':"Venga venga, rapidito",
     'demeco':"https://i.ibb.co/Q6H5jDJ/alberto.png",
     'de meco':"https://i.ibb.co/Q6H5jDJ/alberto.png",
     'quien es tu novio':"https://i.ibb.co/Q6H5jDJ/alberto.png",
    'quien fuma':"el puma",
    'has fichado':"https://www.youtube.com/watch?v=KRFHH36_2bI",
    'hay un error en testanticimex':"Eso no es error porque es de test, pero habría que darselo a diseño",
    'tengo un problema':"eso lo sabe Jose, pregunta a Jose, porque sera de base de datos",
    'te veo bien':"Pues los popover igual te fallan",
     'sonrie':"https://lh3.googleusercontent.com/-Yq-kRIjQAfQ/Wl8GzExWtCI/AAAAAAAADkA/h9vb0YDl_sgAPmQNZljz6AfdiVZtPM88gCK8BGAs/s0/2018-01-17.png",
     'que quieres hacerle a alberto':"https://lh3.googleusercontent.com/-tkusb84-qFA/WWiJCgx02HI/AAAAAAAADOs/22xr1qYMQr8eepFPpc9zOphDkHd14OigwCK8BGAs/s0/lol.gif",
     'que quieres hacer':"https://lh3.googleusercontent.com/-tkusb84-qFA/WWiJCgx02HI/AAAAAAAADOs/22xr1qYMQr8eepFPpc9zOphDkHd14OigwCK8BGAs/s0/lol.gif",
     'casual':"https://i.ibb.co/37WYJcb/casual.jpg",
     'muestrame tu futuro':"https://i.ibb.co/QC0gW4r/loranca-boina.jpg",
     'como vas a ser de mayor':"https://i.ibb.co/QC0gW4r/loranca-boina.jpg",
     'que tal estas':"como buen siwenso recogiendo miel",
     'jugamos al teto':"vale agachate que te la meto",
     '2+2':"En cuatro te voy a poner a ti",
     'te has apuntado al curso':"yo te la impulso",
     'me han cortado los brazos y las piernas':"Buah, te acompaño en el sentimiento, tronco",
     'enseña tu foto':"https://i.ibb.co/LJBQfj8/loranca.jpg",
     'quitate la boina':"https://lh3.googleusercontent.com/--KruA7UbQ_g/X5FDp7O-zpI/AAAAAAAAEUg/0ik_5_W1q0AGW_q0YHtrD0FOvMVuxmc-wCL8CGAsYHg/s0/joseluis.jpg",
     'voy al baño': "Que no te pase como a mi https://lh3.googleusercontent.com/-aR76KX3nLlY/X5FEct8vL0I/AAAAAAAAEUs/z0GK5m0iVyQJILl_1QcxQmQ2IT4n0-aqwCL8CGAsYHg/s0/piero.jpg",
     'que piensa dani': "Este es Dani https://i.ibb.co/VtWB2SP/dani.jpg",
     'tienes redes sociales':"Si tengo agregame! https://lh3.googleusercontent.com/-aBVy_9UNJTk/X5FF9YJI9HI/AAAAAAAAEVE/E6BLB3J0i9YIxnILVOFAkw4IWUsHJkKaACL8CGAsYHg/s0/1003781571218278962%253Faccount_id%253D1",
     'tienes facebook':"Si tengo agregame! https://lh3.googleusercontent.com/-aBVy_9UNJTk/X5FF9YJI9HI/AAAAAAAAEVE/E6BLB3J0i9YIxnILVOFAkw4IWUsHJkKaACL8CGAsYHg/s0/1003781571218278962%253Faccount_id%253D1",
     'adrian tiene facebook':"si es este de aquí https://lh3.googleusercontent.com/-PvfKPO9ET8Q/X5FHetH1G5I/AAAAAAAAEVU/zEHDZVyYWUgcKcNB4og0907CoM4uJRIzACL8CGAsYHg/s0/resultado1.png",
    'que tonto eres':"Pero bueno y este tío de dónde lo han sacado?",
    'como era jose de flaco':"Así https://lh3.googleusercontent.com/-cfjsLBQMwok/X5FIE05c45I/AAAAAAAAEVc/xuOnIFm6QLUiHcgzf8SWg5Xza5QV-BTQQCL8CGAsYHg/s0/seguido%2Bdoblado_phixr.jpg",
     'jose de flaco':"Así https://lh3.googleusercontent.com/-cfjsLBQMwok/X5FIE05c45I/AAAAAAAAEVc/xuOnIFm6QLUiHcgzf8SWg5Xza5QV-BTQQCL8CGAsYHg/s0/seguido%2Bdoblado_phixr.jpg",
     'foto sexy':"Esta me la hice en el Salvador https://i.ibb.co/t85rFfy/foto-sexy.png",
     'aseguradoras':"http://aseguradoras.anticimex.com.es",
     'ip': "https://www.whatismyip.com/es/",
     'base de conocimiento': "https://docs.google.com/document/d/1xLRh4URO09TEOgSL8BxnMSx4YtpRA8zxzx-BrxgYdO0/edit",
     'jenkins':"http://35.195.153.179/",
     'produccion1':"http://34.77.70.71:8080/inicio",
     'produccion2':"http://104.155.43.184:8080/inicio",
     'produccion3':"Dios da pan a quien no tiene dientes...",
     'produccion4':"http://146.148.122.65:8080/inicio",
     'produccion5':"http://34.76.6.55:8080/inicio",
     'produccion6':"eres tonto o qué?",
     'produccion7':"http://35.233.114.77:8080/inicio",
     'produccion8':"http://34.77.164.246:8080/inicio",
     'produccion9':"http://35.190.207.55:8080/inicio",
     'cv de pierinho':"https://pierinho13.github.io/",
     'seguido doblado':'if(true) { logger.info("fuera de programación") }',
     'monitor' : "http://35.189.198.53",
     'admincluster': "gcloud container clusters get-credentials admincluster --zone europe-west1-c",
     'igeocluster': "gcloud container clusters get-credentials igeocluster --zone europe-west1-c",
     'kubernetes' : "https://docs.google.com/document/d/1DADAjdO1C05GitQf8SOY4igI2iq-bN8EIgEc3IRyJtQ/edit?ts=5b3f52f1",
     'changelogs' : "https://drive.google.com/drive/u/1/folders/1P_hVqbbd7DtQ6_YqFJ9ybhwrDtZM8IQq",
    'jorginho':'PUTA',
    'jorgiño':'PUTA',
    'productividad':"El teletrabajo aumenta un 85% la productividad segun Microsoft https://emprendedor.com/home-office-productividad-jefes-desconfianza-paranoia-estudio-microsoft/?fbclid=IwAR0TMfsjloUHAo3JSjOXTOQOfjoYUY2Xlx1H6sqnliZYtkRIZSTAr87_H68",
    'que opinas del teletrabajo':"El teletrabajo aumenta un 85% la productividad segun Microsoft https://emprendedor.com/home-office-productividad-jefes-desconfianza-paranoia-estudio-microsoft/?fbclid=IwAR0TMfsjloUHAo3JSjOXTOQOfjoYUY2Xlx1H6sqnliZYtkRIZSTAr87_H68",
    'editarme':'https://script.google.com',
    'armando':["G"+"\n"+"U"+"\n"+"A"+"\n"+"D"+"\n"+"A"+"\n"+"L"+"\n"+"U"+"\n"+"P"+"\n"+"O","Guadalupo",
                              "G-U-A-D-A-L-U-P-O",
                              "Guada ..... lupo"],
    'lalala':"lololo",
    'comando descargar dependencia especifica':"mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:copy -Dartifact=GeoERP:Properties2Json:1.0.0:jar -DoutputDirectory=/tmp/pruebadependencies -Dmdep.stripVersion=true",
    'temazo':"https://www.youtube.com/watch?v=oYOxpRm XZE"
  };

  return mapaKeysRespuestas;

}


function obtieneRespuestasDefault() {


  var respuestasDefault = [
    "Voy a reiniciar preproduccion",
    "Tu eres tonto",
    "Preguntaselo a Dani",
    "Para que veas lo que hay que aguantar",
    "fala espanholo ou portuguesi?",
    "disfruta lo votado",
    "pierinhada",
    "a ti no te gusta que te den?",
    "musica para mis oidos",
    "tonto el que lo lea",
    "has sacado al amigo fiel para celebrar?",
    "tas tonto?",
    "estan parando feos a la entrada de san fernando desde torrejon, donde la audiencia nacional. lo digo para que vayas por otro lado, a ti seguramente te paren",
    "porque te insultas tio, no seas tan cruel contigo mismo",
    "te vi asomar por encima de la pantalla y casi me da un ictus",
    "sacando un cafe sin pedir a papi?",
    "Venga venga, rapidito",
    "Pongase a trabajar de una puta vez",
    "La palabra feo se queda corta contigo",
    "Que fácil es meterse con el pobre compañero",
    "no te quiere ni tu perro"
  ];
  return respuestasDefault;
}


function obtieneRespuestasPersonalizadas() {

    var respuestasPersonalizadas = {
  
    'daniel.ruizbazan@igeoerp.com': [
                            "Vete a comprar un Iphone", 
                            "Tu calla que eres muy pesao",
                            "Make America great again",
                            "En Valdemorillo solo puede vivir gente con guion en el apellido",
                            "Diselo a tu amigo",
                            "Tus amigos https://i.ibb.co/jT14h3Q/trmpsbols.jpg",
                            "Venga anda ponte a currar",
                            'El sistema esta intentando deducir tu cara. Logrado '
                            ],
    'raul.marquez@igeoerp.com': [
                              "Tu no me hables Raul que me odias"
                              ],
    'armando.benitez@igeoerp.com': [
                              "Guadalupo",
                              "G-U-A-D-A-L-U-P-O",
                              "Guada ..... lupo",
                              "G"+"\n"+"U"+"\n"+"A"+"\n"+"D"+"\n"+"A"+"\n"+"L"+"\n"+"U"+"\n"+"P"+"\n"+"O"
                              ]
  } 
  
  
  return respuestasPersonalizadas;

}

function isSolicitaAyuda(entrada) {

    var ayudaArray = ['keys','que sabes decir','que puedo preguntarte','help','ayuda']; 
    
    var solicitaAyuda = false;
  
    var ayudaLength = ayudaArray.length;
  
    while(ayudaLength--) {
       if (entrada.indexOf(ayudaArray[ayudaLength])!=-1) {
         solicitaAyuda = true;
       }
    }
  
  return solicitaAyuda;
}

function esUsuarioPersonalizado(respuestasPersonalizadas,event) {
  
    var usuariosPersonalizados = [];
    
    for(var u in respuestasPersonalizadas)  {
        usuariosPersonalizados.push(u);
    }
    
    var usuarioPersonalizado = false;
      
    var usuariosPersonalizadosLength = usuariosPersonalizados.length;
  
    while(usuariosPersonalizadosLength--) {
       if (event.user.email.indexOf(usuariosPersonalizados[usuariosPersonalizadosLength])!=-1) {
         usuarioPersonalizado = true;
       }
    }
  
  return usuarioPersonalizado;
}




/**
 * Updates a card that was attached to a message with a previewed link.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app. Either a new card attached to
 * the message with the previewed link, or an update to an existing card.
 */
function onCardClick(event) {
  // Checks whether the message event originated from a human or a Chat app
  // and sets actionResponse to "UPDATE_USER_MESSAGE_CARDS if human or
  // "UPDATE_MESSAGE" if Chat app.
  const actionResponseType = event.message.sender.type === 'HUMAN' ?
    'UPDATE_USER_MESSAGE_CARDS' :
    'UPDATE_MESSAGE';

  // To respond to the correct button, checks the button's actionMethodName.
  if (event.action.actionMethodName === 'assign') {
    return assignCase(actionResponseType);
  }
}

/**
 * Updates a card to say that "You" are the assignee after clicking the Assign
 * to Me button.
 *
 * @param {String} actionResponseType Which actionResponse the Chat app should
 * use to update the attached card based on who created the message.
 * @return {Object} Response from the Chat app. Updates the card attached to
 * the message with the previewed link.
 */
function assignCase(actionResponseType) {
  return {
    'actionResponse': {

      // Dynamically returns the correct actionResponse type.
      'type': actionResponseType,
    },
    'cardsV2': [{
      'cardId': 'assignCase',
      'card': {
        'header': {
          'title': 'Example Customer Service Case',
          'subtitle': 'Case basics',
        },
        'sections': [{
          'widgets': [
            {'keyValue': {'topLabel': 'Case ID', 'content': 'case123'}},
            {'keyValue': {'topLabel': 'Assignee', 'content': 'You'}},
            {'keyValue': {'topLabel': 'Status', 'content': 'Open'}},
            {
              'keyValue': {
                'topLabel': 'Subject', 'content': 'It won\'t turn on...',
              }
            },
          ],
        },
        {
          'widgets': [{
            'buttons': [
              {
                'textButton': {
                  'text': 'OPEN CASE',
                  'onClick': {
                    'openLink': {
                      'url': 'https://support.example.com/orders/case123',
                    },
                  },
                },
              },
              {
                'textButton': {
                  'text': 'RESOLVE CASE',
                  'onClick': {
                    'openLink': {
                      'url': 'https://support.example.com/orders/case123?resolved=y',
                    },
                  },
                },
              },
              {
                'textButton': {
                  'text': 'ASSIGN TO ME',
                  'onClick': {'action': {'actionMethodName': 'assign'}},
                },
              },
            ],
          }],
        }],
      },
    }],
  };
}

function getHistorial(usuario) {
  
  var scriptProperties = PropertiesService.getScriptProperties();
  var historialGuardado = scriptProperties.getProperty('historico_'+usuario) || '[]';
  var historialActualizado = JSON.parse(historialGuardado);

  return historialActualizado;
}


function guardarHistorial(historial, usuario) {
  var MAX_ENTRADAS = 10;
  
  var scriptProperties = PropertiesService.getScriptProperties();
  var historialGuardado = scriptProperties.getProperty('historico_'+usuario) || '[]';
  var historialActualizado = JSON.parse(historialGuardado);

  historialActualizado.push(historial);

  if (historialActualizado.length > MAX_ENTRADAS) {
    historialActualizado = historialActualizado.slice(-MAX_ENTRADAS);
  }

  scriptProperties.setProperty('historial_'+usuario, JSON.stringify(historialActualizado));
}



 
