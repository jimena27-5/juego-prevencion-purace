const $ = id => document.getElementById(id);


/* =====================================================
   ELEMENTOS
===================================================== */

const pantallaInicio =
    $("pantallaInicio");

const juego =
    $("juego");

const tablero =
    $("tablero");

const nivelActual =
    $("nivelActual");

const tiempo =
    $("tiempo");

const parejasEncontradas =
    $("parejasEncontradas");

const porcentaje =
    $("porcentaje");

const barraProgreso =
    $("barraProgreso");

const mensajeNivel =
    $("mensajeNivel");

const panelLista =
    $("panelLista");

const listaResultados =
    $("listaResultados");

const panelPausa =
    $("panelPausa");

const panelFinal =
    $("panelFinal");

const tituloFinal =
    $("tituloFinal");

const textoFinal =
    $("textoFinal");

const btnSiguiente =
    $("btnSiguiente");


/* =====================================================
   CARTAS
===================================================== */

const CARTAS = [

    {
        id:"agua",
        nombre:"Agua",
        imagen:"img/agua.png"
    },

    {
        id:"documentos",
        nombre:"Documentos",
        imagen:"img/documentos.png"
    },

    {
        id:"tapabocas",
        nombre:"Tapabocas",
        imagen:"img/tapabocas.png"
    },

    {
        id:"linterna",
        nombre:"Linterna",
        imagen:"img/linterna.png"
    },

    {
        id:"botiquin",
        nombre:"Botiquín",
        imagen:"img/botiquin.png"
    },

    {
        id:"comida",
        nombre:"Comida enlatada",
        imagen:"img/comida.png"
    },

    {
        id:"silbato",
        nombre:"Silbato",
        imagen:"img/silbato.png"
    },

    {
        id:"ropa",
        nombre:"Ropa de cambio",
        imagen:"img/ropa.png"
    },

    {
        id:"gorra",
        nombre:"Gorra",
        imagen:"img/gorra.png"
    },

    {
        id:"caja",
        nombre:"Caja de emergencia",
        imagen:"img/caja.png"
    }
];


/* =====================================================
   ESTADO
===================================================== */

let nivel =
    Number(
        localStorage.getItem(
            "nivelMemoriaPurace"
        )
    ) || 1;

let tiempoRestante = 120;

let temporizador = null;

let primeraCarta = null;

let segundaCarta = null;

let bloqueado = true;

let parejas = 0;

let totalParejas = 2;

let juegoActivo = false;

let pausado = false;


/* =====================================================
   RESULTADOS
===================================================== */

let resultados =
    JSON.parse(
        localStorage.getItem(
            "resultadosMemoriaPurace"
        ) || "[]"
    );


/* =====================================================
   CANTIDAD DE PAREJAS
===================================================== */

function obtenerParejas(){

    /*
       Nivel 1 = 2 parejas
       Nivel 2 = 3 parejas
       Nivel 3 = 4 parejas

       Va aumentando una pareja
       cada nivel hasta llegar a 10.
    */

    return Math.min(
        10,
        nivel + 1
    );
}


/* =====================================================
   TIEMPO
===================================================== */

function obtenerTiempo(){

    return Math.max(
        35,
        Math.round(
            120 -
            (
                nivel - 1
            ) * 1.2
        )
    );
}


/* =====================================================
   INICIO
===================================================== */

$("btnIniciar").onclick =
    () => {

        juegoActivo = true;

        pausado = false;

        pantallaInicio
            .classList
            .add("oculto");

        juego
            .classList
            .remove("oculto");

        prepararNivel();
    };


/* =====================================================
   PREPARAR NIVEL
===================================================== */

function prepararNivel(){

    detenerTemporizador();

    primeraCarta = null;

    segundaCarta = null;

    bloqueado = true;

    parejas = 0;

    totalParejas =
        obtenerParejas();

    tiempoRestante =
        obtenerTiempo();


    nivelActual.textContent =
        `${nivel} / 60`;


    tiempo.textContent =
        formatearTiempo(
            tiempoRestante
        );


    parejasEncontradas.textContent =
        `0 / ${totalParejas}`;


    porcentaje.textContent =
        "0%";


    barraProgreso.style.width =
        "0%";


    mensajeNivel.textContent =
        "MEMORIZA LAS FICHAS";


    tablero.innerHTML =
        "";


    const mazo =
        crearMazo(
            totalParejas
        );


    crearTablero(
        mazo
    );


    /*
       AHORA SE MUESTRAN
       SOLO 0,8 SEGUNDOS.
    */

    mostrarTodas();


    setTimeout(
        () => {

            if (
                !juegoActivo
            ) {
                return;
            }


            if (
                pausado
            ) {
                return;
            }


            ocultarTodas();


            bloqueado =
                false;


            mensajeNivel.textContent =
                "ENCUENTRA LAS PAREJAS";


            iniciarTemporizador();

        },
        800
    );
}


/* =====================================================
   CREAR MAZO
===================================================== */

function crearMazo(
    cantidadParejas
){

    const seleccion =
        CARTAS.slice(
            0,
            cantidadParejas
        );


    let mazo = [];


    seleccion.forEach(
        carta => {

            /*
               DOS COPIAS EXACTAS.
            */

            mazo.push({
                ...carta,
                copia:1
            });


            mazo.push({
                ...carta,
                copia:2
            });
        }
    );


    /*
       MEZCLAR.
    */

    for (
        let i =
            mazo.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random()
                *
                (i + 1)
            );


        [
            mazo[i],
            mazo[j]
        ] =
        [
            mazo[j],
            mazo[i]
        ];
    }


    return mazo;
}


/* =====================================================
   TABLERO
===================================================== */

function crearTablero(
    mazo
){

    /*
       En computador:

       Hasta 20 fichas:
       4 columnas.

       Así quedan:
       4 x 1
       4 x 2
       4 x 3
       4 x 4
       4 x 5

       En celular el CSS
       las pone en 3 columnas.
    */

    tablero.style.gridTemplateColumns =
        "repeat(4,minmax(0,1fr))";


    mazo.forEach(
        carta => {

            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "carta";


            boton.dataset.id =
                carta.id;


            boton.innerHTML = `

                <div
                    class="carta-interior"
                >

                    <div
                        class="cara cara-atras"
                    >

                        <div class="signo">
                            ?
                        </div>

                        <small>
                            MEMORIA
                        </small>

                    </div>


                    <div
                        class="cara cara-frente"
                    >

                        <img
                            src="${carta.imagen}"
                            alt="${carta.nombre}"
                        >

                    </div>

                </div>
            `;


            boton.onclick =
                () =>
                    seleccionarCarta(
                        boton
                    );


            tablero.appendChild(
                boton
            );
        }
    );
}


/* =====================================================
   MOSTRAR TODAS
===================================================== */

function mostrarTodas(){

    document
        .querySelectorAll(
            ".carta"
        )
        .forEach(
            carta =>
                carta.classList.add(
                    "volteada"
                )
        );
}


/* =====================================================
   OCULTAR TODAS
===================================================== */

function ocultarTodas(){

    document
        .querySelectorAll(
            ".carta"
        )
        .forEach(
            carta =>
                carta.classList.remove(
                    "volteada"
                )
        );
}


/* =====================================================
   SELECCIONAR
===================================================== */

function seleccionarCarta(
    carta
){

    if (
        bloqueado
    ){
        return;
    }


    if (
        pausado
    ){
        return;
    }


    if (
        carta.classList.contains(
            "volteada"
        )
    ){
        return;
    }


    if (
        carta.classList.contains(
            "acertada"
        )
    ){
        return;
    }


    carta.classList.add(
        "volteada"
    );


    if (
        !primeraCarta
    ){

        primeraCarta =
            carta;

        return;
    }


    segundaCarta =
        carta;


    bloqueado =
        true;


    comprobarPareja();
}


/* =====================================================
   COMPROBAR
===================================================== */

function comprobarPareja(){

    const iguales =
        primeraCarta.dataset.id ===
        segundaCarta.dataset.id;


    if (
        iguales
    ){

        parejaCorrecta();

    }else{

        parejaIncorrecta();
    }
}


/* =====================================================
   CORRECTA
===================================================== */

function parejaCorrecta(){

    primeraCarta
        .classList
        .add(
            "acertada"
        );


    segundaCarta
        .classList
        .add(
            "acertada"
        );


    parejas++;


    parejasEncontradas.textContent =
        `${parejas} / ${totalParejas}`;


    const progreso =
        Math.round(
            (
                parejas /
                totalParejas
            )
            *
            100
        );


    porcentaje.textContent =
        progreso + "%";


    barraProgreso.style.width =
        progreso + "%";


    primeraCarta =
        null;


    segundaCarta =
        null;


    bloqueado =
        false;


    /*
       GANÓ EL NIVEL.
    */

    if (
        parejas >=
        totalParejas
    ){

        ganarNivel();
    }
}


/* =====================================================
   INCORRECTA
===================================================== */

function parejaIncorrecta(){

    setTimeout(
        () => {

            if (
                primeraCarta
            ){

                primeraCarta
                    .classList
                    .remove(
                        "volteada"
                    );
            }


            if (
                segundaCarta
            ){

                segundaCarta
                    .classList
                    .remove(
                        "volteada"
                    );
            }


            primeraCarta =
                null;


            segundaCarta =
                null;


            bloqueado =
                false;

        },
        650
    );
}


/* =====================================================
   TEMPORIZADOR
===================================================== */

function iniciarTemporizador(){

    detenerTemporizador();


    temporizador =
        setInterval(
            () => {

                if (
                    pausado
                ){
                    return;
                }


                tiempoRestante--;


                tiempo.textContent =
                    formatearTiempo(
                        tiempoRestante
                    );


                if (
                    tiempoRestante <= 0
                ){

                    perderNivel();
                }

            },
            1000
        );
}


function detenerTemporizador(){

    if (
        temporizador
    ){

        clearInterval(
            temporizador
        );

        temporizador =
            null;
    }
}


function formatearTiempo(
    segundos
){

    const minutos =
        Math.floor(
            segundos / 60
        );


    const segundosFinal =
        segundos % 60;


    return (
        String(minutos)
            .padStart(2,"0")
        +
        ":"
        +
        String(segundosFinal)
            .padStart(2,"0")
    );
}


/* =====================================================
   GANÓ
===================================================== */

function ganarNivel(){

    detenerTemporizador();

    bloqueado = true;


    guardarResultado(
        nivel,
        true
    );


    if (
        nivel >= 60
    ){

        tituloFinal.textContent =
            "¡COMPLETASTE LOS 60 NIVELES!";


        textoFinal.textContent =
            "Terminaste toda la Memoria de Emergencia.";


        btnSiguiente.style.display =
            "none";

    }else{

        tituloFinal.textContent =
            "¡NIVEL COMPLETADO!";


        textoFinal.textContent =
            `Superaste el nivel ${nivel}. Ahora tendrás más fichas.`;


        btnSiguiente.style.display =
            "block";
    }


    panelFinal
        .classList
        .remove(
            "oculto"
        );
}


/* =====================================================
   PERDIÓ
===================================================== */

function perderNivel(){

    detenerTemporizador();

    bloqueado = true;


    guardarResultado(
        nivel,
        false
    );


    tituloFinal.textContent =
        "TIEMPO AGOTADO";


    textoFinal.textContent =
        `No completaste el nivel ${nivel}.`;


    btnSiguiente.style.display =
        "none";


    panelFinal
        .classList
        .remove(
            "oculto"
        );
}


/* =====================================================
   GUARDAR RESULTADO
===================================================== */

function guardarResultado(
    numeroNivel,
    ganado
){

    resultados.push({

        nivel:
            numeroNivel,

        resultado:
            ganado
                ? "GANADO"
                : "PERDIDO",

        fecha:
            new Date()
                .toLocaleString(
                    "es-CO"
                )
    });


    localStorage.setItem(
        "resultadosMemoriaPurace",
        JSON.stringify(
            resultados
        )
    );


    localStorage.setItem(
        "nivelMemoriaPurace",
        String(
            nivel
        )
    );
}


/* =====================================================
   LISTA DE RESULTADOS
===================================================== */

function mostrarResultados(){

    if (
        !resultados.length
    ){

        listaResultados.innerHTML = `
            <div class="resultado">

                <span>
                    Todavía no hay resultados.
                </span>

            </div>
        `;

        return;
    }


    listaResultados.innerHTML =
        resultados
            .slice()
            .reverse()
            .map(
                resultado => `

                <div
                    class="resultado ${
                        resultado.resultado ===
                        "GANADO"
                            ? "gano"
                            : "perdio"
                    }"
                >

                    <span>
                        NIVEL ${resultado.nivel}
                    </span>

                    <strong>
                        ${resultado.resultado}
                    </strong>

                    <small>
                        ${resultado.fecha}
                    </small>

                </div>
            `
            )
            .join("");
}


/* =====================================================
   BOTÓN LISTA
===================================================== */

$("btnLista").onclick =
    () => {

        mostrarResultados();

        panelLista
            .classList
            .remove(
                "oculto"
            );
    };


$("cerrarLista").onclick =
    () => {

        panelLista
            .classList
            .add(
                "oculto"
            );
    };


/* =====================================================
   SIGUIENTE NIVEL
===================================================== */

$("btnSiguiente").onclick =
    () => {

        if (
            nivel < 60
        ){

            nivel++;


            localStorage.setItem(
                "nivelMemoriaPurace",
                String(nivel)
            );


            panelFinal
                .classList
                .add(
                    "oculto"
                );


            prepararNivel();
        }
    };


/* =====================================================
   VOLVER A JUGAR
===================================================== */

$("btnVolverJugar").onclick =
    () => {

        nivel = 1;


        localStorage.setItem(
            "nivelMemoriaPurace",
            "1"
        );


        panelFinal
            .classList
            .add(
                "oculto"
            );


        prepararNivel();
    };


$("btnRepetir").onclick =
    () => {

        panelFinal
            .classList
            .add(
                "oculto"
            );


        prepararNivel();
    };


/* =====================================================
   VOLVER AL MENÚ
===================================================== */

$("btnVolverMenu").onclick =
    () => {

        location.href =
            "menu.html";
    };


$("btnMenuFinal").onclick =
    () => {

        location.href =
            "menu.html";
    };


$("btnMenuPausa").onclick =
    () => {

        location.href =
            "menu.html";
    };


/* =====================================================
   PAUSA
===================================================== */

$("btnPausa").onclick =
    () => {

        if (
            !juegoActivo
        ){
            return;
        }


        pausado =
            true;


        bloqueado =
            true;


        detenerTemporizador();


        panelPausa
            .classList
            .remove(
                "oculto"
            );
    };


$("btnContinuar").onclick =
    () => {

        pausado =
            false;


        panelPausa
            .classList
            .add(
                "oculto"
            );


        bloqueado =
            false;


        iniciarTemporizador();
    };


$("btnReiniciarPausa").onclick =
    () => {

        panelPausa
            .classList
            .add(
                "oculto"
            );


        pausado =
            false;


        prepararNivel();
    };


/* =====================================================
   PROTECCIÓN CONTRA SCROLL
===================================================== */

document.addEventListener(
    "keydown",
    e => {

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                " "
            ].includes(
                e.key
            )
        ){

            e.preventDefault();
        }
    },
    {
        passive:false
    }
);