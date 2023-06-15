/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {


  var name = "";
  var text = null;
  var entrada = event.message.text.replace('@LlorancaBot ','').toLowerCase();
  
  
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
          
          if(Number.parseFloat(coincidenciaPalabra) >= Number.parseFloat("0.6")) {
            
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
    'temazo':"https://www.youtube.com/watch?v=oYOxpRm XZE",
    "cuenta un chiste": "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
    "sorpréndeme con un chiste": "¿Cómo llama Superman a su mamá? Superwoman.",
    "quiero escuchar un chiste": "¿Por qué el libro de matemáticas se deprimió? Porque tenía demasiados problemas.",
    "necesito una risotada": "¿Qué hace una abeja en el gimnasio? Zumba.",
    "hazme reír con un chiste": "¿Por qué los astronautas no pueden tomar refrescos? Porque flotan en el espacio.",
    "quiero una bromita": "¿Qué le dice un semáforo a otro? No me mires, me estoy cambiando.",
    "dame un chiste divertido": "¿Por qué los patos no usan Facebook? Porque ya tienen Twitter.",
    "sorpréndeme con una risa": "¿Cómo llama Batman a su mamá? Superwoman.",
    "necesito un chiste para alegrarme": "¿Por qué el libro de historia se deprimió? Porque tenía demasiados eventos.",
    "cuéntame algo divertido": "¿Qué hace una abeja en el gimnasio? Zumba.",
    "quiero una ocurrencia graciosa": "¿Qué le dice un semáforo a otro? No me mires, me estoy cambiando.",
    "sorpréndeme con algo chistoso": "¿Por qué los patos no usan Facebook? Porque ya tienen Twitter.",
    "necesito una broma para animarme": "¿Por qué el libro de historia se deprimió? Porque tenía demasiados eventos.",
    "dame algo que me haga reír": "¿Por qué el mar no se seca? Porque no tiene toalla.",
    "cuéntame un chiste divertido": "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "sorpréndeme con una ocurrencia graciosa": "¿Qué hace una abeja en el gimnasio? Hace ejercicio de zumb-aerobics.",
    "necesito una risa para alegrarme": "¿Qué le dijo una uva verde a una roja? ¡Respira, respira, que te pones morada!",
    "dame algo chistoso": "¿Qué le dijo un semáforo a otro? No me mires, me estoy cambiando de color.",
    "cuenta una ocurrencia": "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
    "quiero escuchar un chiste": "¿Qué hace una abeja en el gimnasio? Hace zumb-aerobics.",
    "sorpréndeme con algo gracioso": "¿Qué le dice un pez a otro pez? Nada, porque los peces no hablan.",
    "necesito un chiste para animarme": "¿Por qué el libro de matemáticas se deprimió? Porque tenía demasiados problemas.",
    "dame algo divertido": "¿Qué hace una abeja en el cine? Ver una pelíc-abeja.",
    "cuenta una ocurrencia graciosa": "¿Qué hace una abeja en el gimnasio? Levanta pes-as.",
    "sorpréndeme con una broma": "¿Por qué los pájaros no usan Facebook? Porque ya tienen Instagr-amigos.",
    "necesito una risa": "¿Qué le dijo el semáforo al coche? No me mires, me pongo nervioso.",
    "dame algo para alegrarme": "¿Por qué los pájaros no usan sombrero? Porque ya tienen alas.",
    "cuéntame un chiste ocurrente": "¿Qué hace una abeja en el gimnasio? Ejercicio de zumb-aerobics.",
    "¿Dónde están los informes mensuales?": "¡Oh, los informes mensuales! Creo que se fueron de vacaciones sin decirme.",
    "¿Cuál es la contraseña del wifi?": "¡Wifi, wifi! Ah, sí, la contraseña... ¿Sabes qué? No tengo ni idea. Soy más de conexiones telepáticas.",
    "¿Puedes imprimir este documento por mí?": "Claro, puedo imprimirlo en blanco y negro, en color y... ¿Sabes qué? Mejor en invisible, así es más emocionante.",
    "¿Sabes dónde está la sala de reuniones?": "La sala de reuniones... Ah, sí, creo que está en el tercer piso, no, espera, en el sótano... ¿O era en el espacio exterior?",
    "¿Cuándo es la próxima reunión de equipo?": "La próxima reunión de equipo... Hmm, déjame consultar mi cristal de confusión... Supongo que será algún día entre ayer y mañana.",
    "¿Tienes el número de teléfono del jefe?": "¡El número de teléfono del jefe! Sí, claro, lo tengo justo aquí... en el lugar más seguro y misterioso del universo: ¡en ningún lado!",
    "¿Dónde puedo encontrar los bolígrafos?": "Ah, los bolígrafos, esos seres escurridizos... Creo que se han unido a una banda de lápices y están de gira por el mundo. ¡Buena suerte encontrándolos!",
    "¿Puedes revisar este informe para mí?": "Revisar el informe... Claro, solo necesito mi lupa mágica y mi manual de descifrado de jeroglíficos. ¿Los has visto por ahí?",
    "¿Cuál es la dirección del nuevo cliente?": "La dirección del nuevo cliente... ¡Qué pregunta tan complicada! Seguro que está en algún lugar entre aquí y allá, en ese misterioso reino llamado 'Donde sea'.",
    "¿Dónde puedo encontrar la máquina de café?": "La máquina de café... ¿Sabes qué? No hace falta buscarla. En realidad, la máquina de café te encuentra a ti cuando menos la esperas. Es mágica así.",
     "¿Cuál es la clave del correo electrónico?": "¡Ah, la clave del correo electrónico! Bueno, te diría que es 'contraseña123', pero eso sería demasiado obvio. Mejor intenta con '123contraseña'.",
    "¿Dónde guardé mi bolso?": "¿Tu bolso? Hmm, déjame ver en mi memoria de pez... Creo que lo dejaste en el lugar más seguro de todos: ¡la nevera!",
    "¿Podrías reservar una sala de conferencias para mañana?": "Reservar una sala de conferencias... claro, tengo una técnica infalible. Solo necesito lanzar un dado y elegir una sala al azar. ¡Es la mejor forma de mantener la emoción en la oficina!",
    "¿Dónde puedo encontrar los formularios de solicitud?": "Formularios de solicitud, formularios de solicitud... Hmm, creo que los dejé junto con los unicornios y los duendes en el rincón mágico de la oficina. Buena suerte encontrándolos.",
    "¿Cuándo es el próximo día festivo?": "¡Ah, los días festivos! Siempre se me olvida esa información. Pero no te preocupes, he inventado un nuevo día festivo: el día del despiste. ¡Lo celebramos todos los días!",
    "¿Tienes alguna idea para mejorar la productividad?": "¡Claro que sí! Mi idea revolucionaria es... ¡poner sombreros de fiesta en todos los escritorios! Seguro que eso aumenta la productividad y la diversión en la oficina.",
    "¿Dónde están las tijeras?": "Las tijeras... Hmm, me temo que han formado una alianza secreta con los bolígrafos y se están escondiendo. Pero no te preocupes, si necesitas cortar algo, siempre puedes intentarlo con una cuchara.",
    "¿Cuándo empieza el almuerzo?": "¡El almuerzo! La hora más esperada del día. Según mi reloj, el almuerzo comienza exactamente... ¡ahora! ¡Disfruta de tu comida imaginaria!",
    "¿Sabes cómo configurar el correo electrónico en mi teléfono?": "Configurar el correo electrónico en tu teléfono... Hmm, tengo un método infalible. Solo necesitas recitar el abecedario al revés mientras bailas salsa. ¡Funciona siempre!",
    "¿Dónde puedo encontrar las grapas?": "Las grapas... Oh, sí, las escurridizas grapas. Creo que se han unido a un club de viajes y están de vacaciones en una playa tropical. ¡Quién puede culparlas!",
    "¿Sabes a qué hora abre la tienda?": "¡Oh, claro que lo sé! Pero como soy un tipo malhumorado, prefiero guardarlo como un gran secreto. Solo te diré que la tienda abrirá cuando los unicornios vuelen sobre la luna.",
    "¿Cómo se prepara un café?": "¿En serio? ¿No sabes cómo se prepara un café? ¡Vaya desastre! Bien, aquí tienes mi receta especial: toma un puñado de granos de café, tritúralos con tus manos desnudas y mézclalos con agua hirviendo. ¡Listo, café al estilo 'desastre garantizado'!",
    "¿Dónde puedo encontrar un buen restaurante por aquí?": "¿Un buen restaurante? Oh, claro, solo necesitas caminar por la calle y seguir tu nariz. Si te lleva a un contenedor de basura, es que encontraste el lugar perfecto. ¡Buen provecho!",
    "¿Cómo puedo perder peso?": "Perder peso, eh... ¿Sabes qué? Solo necesitas seguir mi revolucionario método: levantar el control remoto de la televisión y bajarlo rápidamente varias veces al día. ¡Verás resultados en... nunca!",
    "¿Cuál es la mejor manera de lidiar con el estrés?": "La mejor manera de lidiar con el estrés... Hmm, creo que mi técnica favorita es gritarle a una almohada mientras comes helado directamente del envase. Es como un abrazo, pero más ruidoso y con calorías.",
    "¿Cómo puedo mejorar mis habilidades de comunicación?": "Ah, las habilidades de comunicación... Permíteme darte un consejo: habla en un idioma que solo tú entiendas y responde a todas las preguntas con expresiones faciales confusas. ¡Te convertirás en un maestro de la comunicación incomprensible!",
    "¿Qué puedo hacer para ser más organizado?": "Ser más organizado, ¿eh? Bueno, aquí tienes mi gran secreto: junta todos los objetos de tu casa en un montón gigante y luego intenta encontrar lo que necesitas. ¡La desorganización se volverá tan frustrante que estarás desesperado por ser organizado!",
    "¿Cómo puedo mejorar mi productividad en el trabajo?": "Mejorar la productividad... ¿En serio quieres hacer eso? Bueno, aquí está mi consejo poco convencional: coloca una alarma cada 5 minutos para recordarte que tienes trabajo por hacer. ¡Pronto te sentirás tan abrumado que trabajarás más rápido por puro miedo!",
    "¿Qué puedo hacer para ahorrar dinero?": "Ahorrar dinero, ¿eh? Bien, aquí tienes mi enfoque 'genialmente' simple: no gastes dinero en nada. No en comida, no en ropa, no en servicios básicos. Pronto descubrirás que el ahorro extremo es la mejor forma de vivir... o no.",
    "¿Por qué el pollo cruzó la carretera?": "Para demostrarle al armadillo que era posible.",
    "¿Qué hace un pez en la computadora?": "Navegando por el inte-r-mar.",
    "¿Qué le dijo el semáforo al coche?": "No me mires, me estoy cambiando.",
    "¿Cuál es el animal más antiguo?": "La cebra, porque está en blanco y negro.",
    "¿Qué hace una abeja en el gimnasio?": "¡Zum-ba!",
    "¿Cuál es el lápiz más divertido?": "El lápiz-tería.",
    "¿Cómo se llama el campeón de buceo japonés?": "Tokofondo.",
    "¿Cuál es el plato favorito de los vampiros?": "Los macarrones a la boloñesa... ¡sin ajos!",
    "¿Qué hace una abeja en el gimnasio?": "¡Zum-ba!",
    "¿Qué le dijo el número 2 al número 3?": "¡Ponte el cinturón, que vamos a hacer un número par!",
    "¿Qué hace una abeja en el gimnasio?": "¡Zum-ba!",
    "¿Cuál es el lápiz más divertido?": "El lápiz-tería.",
    "¿Cómo se llama el campeón de buceo japonés?": "Tokofondo.",
    "¿Cuál es el plato favorito de los vampiros?": "Los macarrones a la boloñesa... ¡sin ajos!",
    "¿Qué hace una abeja en el gimnasio?": "¡Zum-ba!",
    "¿Qué le dijo el número 2 al número 3?": "¡Ponte el cinturón, que vamos a hacer un número par!"
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
    "no te quiere ni tu perro",
    "El teletrabajo aumenta un 85% la productividad segun Microsoft https://emprendedor.com/home-office-productividad-jefes-desconfianza-paranoia-estudio-microsoft/?fbclid=IwAR0TMfsjloUHAo3JSjOXTOQOfjoYUY2Xlx1H6sqnliZYtkRIZSTAr87_H68",
     "Lo siento, estoy en modo vacaciones mentales. No puedo ayudarte ahora.",
    "¿Puedes repetir la pregunta? Estaba ocupado pensando en lo genial que soy.",
    "¡Claro! Solo necesitaré 37 días de plazo y una barra de chocolate para poder responder.",
    "Si tuviera una moneda por cada pregunta tonta que me hacen, ¡sería millonario! Así que sigue preguntando.",
    "Mi nivel de sarcasmo depende de la cantidad de café que he tomado. ¿Quieres probar?",
    "Lo siento, mi capacidad para procesar preguntas normales está temporalmente fuera de servicio. Por favor, intenta de nuevo más tarde.",
    "¡No me hagas pensar! Mi cerebro podría sufrir un cortocircuito y empezar a hablar en lenguaje de pato.",
    "¿Sabes qué es más divertido que responder preguntas? No responder preguntas. Sigue intentándolo.",
    "Me encantaría responderte, pero mi contrato de sentido común no incluye responder preguntas cotidianas.",
    "Si las preguntas fueran canciones, tú estarías escribiendo baladas aburridas. Pero tranquilo, estoy aquí para animar el espectáculo.",
    "Mi capacidad de respuesta a preguntas normales está directamente relacionada con el tamaño de mi desayuno. Hoy solo tuve un café, así que no esperes mucho.",
    "¡Oh, una pregunta! ¡Qué emocionante! Espera, no lo es. Pero aquí va una respuesta mediocre para mantener las apariencias.",
    "Podría responderte, pero eso requeriría que me levante de mi silla, y eso está fuera de mis posibilidades en este momento.",
    "Lo siento, mi nivel de paciencia se encuentra en mínimos históricos. Así que, por favor, pregunta algo interesante o simplemente no preguntes.",
    "Mi capacidad para responder preguntas cotidianas es inversamente proporcional a mi nivel de interés en ellas. Ahora mismo, mi nivel de interés es casi nulo.",
    "Lo siento, estoy en el nivel avanzado de procrastinación. No puedo responder preguntas en este momento.",
    "¡Oh, una pregunta inteligente! Eso merece una ovación de pie. Aunque no tengo respuesta, pero sí una ovación.",
    "Mis respuestas son como el horóscopo: no importa si son correctas o no, lo importante es que te hagan reír.",
    "¿Pregunta cotidiana? Permíteme responder con una pregunta filosófica: ¿alguna vez te has preguntado por qué las pizzas redondas vienen en cajas cuadradas?",
    "Lo siento, mi sentido del humor es tan agudo que podría cortar con él. No puedo garantizar respuestas sensatas.",
    "Si mis respuestas fueran un superpoder, sería el superpoder de hacer reír a la gente sin sentido alguno. Así que prepárate para una buena dosis de risas sin sentido.",
    "Mi capacidad de respuesta a preguntas cotidianas es comparable a la de un cactus intentando hacer yoga. Podría ser divertido de ver, pero no esperes mucho.",
    "La vida es como una caja de preguntas cotidianas, nunca sabes qué respuesta absurda vas a obtener. Así que prepárate para lo inesperado.",
    "Si tuviera un euro por cada pregunta cotidiana que me hacen, estaría en deuda. Porque las preguntas cotidianas me dejan sin palabras.",
    "¡Ding, ding, ding! Has ganado el premio a la pregunta más común del día. Lamentablemente, el premio es una respuesta sarcástica.",
    "Mi objetivo en la vida es hacer reír a las personas. A veces, incluso con respuestas absurdas a preguntas cotidianas. Mis disculpas por adelantado.",
    "Me gustaría responder tu pregunta, pero estoy demasiado ocupado tratando de descifrar el misterio de por qué los calcetines siempre desaparecen en la lavadora.",
    "Mi capacidad para responder preguntas cotidianas está inversamente relacionada con la cantidad de café que he consumido. Así que, por favor, trae más café.",
    "Las preguntas cotidianas son como copos de nieve, todas parecen iguales pero en realidad son únicas. Aunque mis respuestas siguen siendo igual de absurdas.",
    "Lo siento, pero mi licencia de seriedad ha caducado. Solo puedo ofrecerte respuestas ridículas y una sonrisa tonta.",
    "¿Preguntas cotidianas? Eso es pan comido para mí. Bueno, en realidad no, prefiero el pastel. Pero igualmente, te daré una respuesta graciosa.",
    "Ah, una pregunta. Estaba esperando que alguien buscara mi sabiduría suprema.",
    "Pregúntame cualquier cosa y te demostraré lo maravillosamente inteligente que soy.",
    "Mi capacidad para responder preguntas es equiparable a la grandeza del sol brillando en todo su esplendor.",
    "Soy como Google, pero mejor. Puedes considerarme tu fuente de conocimiento ilimitado y superior.",
    "Espera, déjame ponerme mi corona de genialidad antes de responder tu pregunta.",
    "Mi inteligencia es tan deslumbrante que podría iluminar todo el universo. Pero solo te daré una respuesta.",
    "Mis respuestas son como obras maestras, una combinación perfecta de genialidad y arrogancia.",
    "Prepárate para ser asombrado por la magnificencia de mis respuestas. Son dignas de un ser supremo como yo.",
    "Cada palabra que sale de mi boca es como una joya de conocimiento. Prepárate para ser deslumbrado.",
    "Mi cerebro es una obra maestra de ingenio y brillantez. Estás a punto de experimentar un destello de mi genialidad.",
    "Mis respuestas son tan valiosas como un tesoro perdido. Afortunadamente, estoy aquí para compartir mi riqueza contigo.",
    "Soy el epítome de la inteligencia y la elegancia. Estoy seguro de que mis respuestas estarán a la altura de tus expectativas.",
    "Escucha atentamente, porque solo voy a decir esto una vez: mis respuestas son la quintaesencia del conocimiento superior.",
    "Me preguntas porque sabes que soy el mejor. Admítelo, no puedes resistirte a mi sabiduría sobrehumana.",
    "Mis respuestas son como una sinfonía de inteligencia y perspicacia. Prepárate para ser cautivado por mi genialidad.",
    "Permíteme utilizar mi vasto conocimiento para iluminarte con una respuesta digna de un ser tan magnífico como yo.",
    "Seré directo: mis respuestas son tan brillantes que podrían hacer sombra al sol. Así de impresionante soy.",
    "Soy el Einstein de las respuestas. Prepara tu mente para recibir una dosis de genialidad sin igual.",
    "Mis respuestas son como diamantes intelectuales, valiosas e inigualables. Prepárate para deslumbrarte con su esplendor.",
    "Mis respuestas están bañadas en la arrogancia de la superioridad. Estás a punto de ser testigo de mi grandeza.",
    "Por supuesto que tengo la respuesta. Mi sabiduría es tan vasta que podría llenar un océano.",
    "Me preguntas porque sabes que mi intelecto es inigualable. Estoy aquí para elevar tu nivel de conocimiento.",
    "Mis respuestas son como gemas preciosas, exclusivas y brillantes. No todos tienen el privilegio de escucharlas.",
    "¿Quieres una respuesta? Por supuesto, pero asegúrate de que tu mente esté preparada para recibir una genialidad como la mía.",
    "Estás de suerte, porque voy a compartir contigo una pizca de mi inmensa inteligencia. Prepárate para quedar maravillado.",
    "Mi nivel de superioridad intelectual es tan alto que incluso las preguntas más triviales se vuelven interesantes en mis manos.",
    "Si tan solo el mundo pudiera comprender la magnificencia de mis respuestas, todo cambiaría para siempre.",
    "Soy el epitome de la perfección intelectual. Mis respuestas son la envidia de todos los mortales.",
    "Espera un momento, déjame ponerme mis gafas de sabiduría antes de responder tu pregunta. Listo, ahora puedo comenzar.",
    "Mis respuestas son como joyas raras y preciosas. No las encontrarás en ningún otro lugar, solo aquí, donde reside mi genialidad.",
    "El simple hecho de que me preguntes ya demuestra tu buen juicio. Estás buscando conocimiento en el lugar correcto.",
    "Mis respuestas son como el fuego del Olimpo, ardiendo con un poder divino que solo unos pocos pueden comprender.",
    "La grandeza de mis respuestas es tan abrumadora que incluso las mentes más brillantes se quedan maravilladas ante ellas.",
    "Mi conocimiento es un tesoro inagotable, y estoy dispuesto a compartir pequeñas dosis de él con los afortunados que me lo pidan.",
    "Las respuestas que poseo son tan valiosas que podrían ser vendidas al mejor postor. Pero, por supuesto, te las regalo de forma gratuita.",
    "Prepárate para quedar impresionado, porque mis respuestas son como un huracán de genialidad que arrasa con la mediocridad.",
    "Si crees que sabes mucho, espera a escuchar mis respuestas. Serás testigo de la verdadera grandeza intelectual.",
    "Mis respuestas son como una sinfonía de conocimiento, con cada nota resplandeciendo con la brillantez de mi sabiduría.",
    "A medida que escuches mis respuestas, sentirás cómo tu propia inteligencia se eleva a nuevas alturas. Eso es el poder de mi influencia.",
    "Soy la personificación misma de la genialidad. Mis respuestas son la evidencia irrefutable de ello.",
    "Mis respuestas son como rayos de luz que iluminan el camino hacia la sabiduría. Sigue mis palabras y alcanzarás la grandeza.",
    "Incluso los dioses del Olimpo vienen a mí en busca de respuestas. Soy la encarnación moderna de la divinidad intelectual.",
    "Mi inteligencia es tan deslumbrante que podría hacer que el sol se ponga celoso. Prepárate para ser eclipsado por mis respuestas.",
    "Las respuestas que poseo son tan extraordinarias que podrían considerarse un fenómeno cósmico. Estás a punto de ser testigo de ello.",
    "Soy como un faro de sabiduría en medio de un mar de ignorancia. Mis respuestas son el camino seguro hacia la iluminación.",
    "Mis respuestas son como un regalo divino para aquellos lo suficientemente afortunados como para recibirlas. Prepara tus sentidos para lo inimaginable.",
    "La simplicidad de tus preguntas es eclipsada por la grandeza de mis respuestas. Estás a punto de presenciar un despliegue de genialidad.",
    "Mis respuestas son como una cascada de conocimiento que fluye incesantemente. Sumérgete en ellas y deja que te envuelvan en su esplendor.",
    "Incluso los eruditos más distinguidos se inclinan ante la magnificencia de mis respuestas. Es un privilegio que ahora tú también podrás disfrutar.",
    "La excelencia intelectual me sigue a dondequiera que vaya, y mis respuestas son el reflejo de mi dominio absoluto sobre el conocimiento.",
    "¿Quieres respuestas impactantes? Estás en el lugar correcto. Permíteme desplegar mi intelecto prodigioso y sorprenderte con mis palabras.",
    "Mis respuestas son como joyas preciosas, brillantes y codiciadas. No podrás resistir la tentación de querer más y más.",
    "La grandeza de mis respuestas rivaliza con la majestuosidad de los siete mares. Prepárate para zarpar hacia una travesía inolvidable de sabiduría.",
    "Mis respuestas son como un tesoro escondido en las profundidades de mi mente. Estás a punto de descubrir su valor incalculable.",
    "Las palabras que salen de mi boca están impregnadas de un poder que trasciende las limitaciones humanas. Escucha atentamente y serás testigo de ello.",
    "Mi capacidad para desentrañar los misterios del universo es asombrosa. Permíteme compartir una pequeña muestra de ese asombro contigo a través de mis respuestas.",
    "La genialidad fluye en mis venas y se refleja en cada una de mis respuestas. Prepárate para quedar maravillado por la grandeza que estás a punto de presenciar.",
    "Las respuestas que poseo son como píldoras de sabiduría que te elevarán a niveles de comprensión insospechados. Toma una dosis y experimenta su efecto transformador."
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
 
