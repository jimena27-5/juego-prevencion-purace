const $ = id => document.getElementById(id);

const canvas = $("runner");
const ctx = canvas.getContext("2d");

let W = innerWidth;
let H = innerHeight;
let dpr = Math.min(devicePixelRatio || 1, 2);


/* =========================================================
   CANVAS
========================================================= */

function resize() {

    W = innerWidth;
    H = innerHeight;

    dpr = Math.min(
        devicePixelRatio || 1,
        2
    );

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

addEventListener(
    "resize",
    resize
);

resize();


/* =========================================================
   IMÁGENES DEL JUEGO
========================================================= */

const ASSETS = {

    agua: "img/agua.png",
    documentos: "img/documentos.png",
    silbato: "img/silbato.png",
    tapabocas: "img/tapabocas.png",
    comida: "img/comida.png",
    linterna: "img/linterna.png",
    gorra: "img/gorra.png",
    ropa: "img/ropa.png",
    botiquin: "img/botiquin.png",

    arbol: "img/arbol.png",
    barrera: "img/barrera.png",
    caja: "img/caja.png",
    piedra: "img/piedra.png",

    /* ANIMACIONES DEL PERSONAJE */
    correr1: "img/correr1.png",
    correr2: "img/correr2.png",

    caminar3: "img/caminar3.png",
    caminar4: "img/caminar4.png",

    saltar1: "img/saltar1.png",
    saltar2: "img/saltar2.png",
    saltar3: "img/saltar3.png",
    saltar4: "img/saltar4.png"
};


const imgs = {};

for (
    const [key, src]
    of Object.entries(ASSETS)
) {

    const img = new Image();

    img.src = src;

    imgs[key] = img;
}


/* =========================================================
   SUMINISTROS
========================================================= */

const items = [

    {
        id: "agua",
        nombre: "AGUA",
        esencial: true
    },

    {
        id: "documentos",
        nombre: "DOCUMENTOS",
        esencial: true
    },

    {
        id: "tapabocas",
        nombre: "TAPABOCAS",
        esencial: true
    },

    {
        id: "linterna",
        nombre: "LINTERNA",
        esencial: true
    },

    {
        id: "botiquin",
        nombre: "BOTIQUÍN",
        esencial: true
    },

    {
        id: "silbato",
        nombre: "SILBATO",
        esencial: false
    },

    {
        id: "comida",
        nombre: "COMIDA ENLATADA",
        esencial: false
    },

    {
        id: "gorra",
        nombre: "GORRA",
        esencial: false
    },

    {
        id: "ropa",
        nombre: "ROPA DE CAMBIO",
        esencial: false
    }

];


const collected = new Set();


function renderList() {

    $("listaItems").innerHTML =
        items.map(
            item => `

            <div class="item-lista">

                <img
                    src="${ASSETS[item.id]}"
                    alt=""
                >

                <span class="nombre">
                    ${item.nombre}
                </span>

                <span
                    class="estado ${
                        collected.has(item.id)
                            ? "ok"
                            : "pendiente"
                    }"
                >
                    ${
                        collected.has(item.id)
                            ? "LISTO"
                            : "PENDIENTE"
                    }
                </span>

            </div>
        `
        ).join("");
}


renderList();


/* =========================================================
   ESTADO
========================================================= */

let state = {

    running: false,

    paused: false,

    gameOver: false,

    lives: 3,

    time: 360,

    distance: 0,

    score: 0,

    coins: 0,

    lane: 1,

    laneVisual: 1,

    jump: 0,

    crouch: false,

    sprinting: false,

    invuln: 0,

    objects: [],

    nextSpawn: 0.7,

    ash: 0,

    shake: 0,

    /* ANIMACIÓN */
    animationTime: 0,

    frame: 0
};


/* =========================================================
   BUCLE DE ANIMACIÓN
   CORRECCIÓN: evita varios bucles al reiniciar
========================================================= */

let animationFrameId = null;


/* =========================================================
   INICIAR
========================================================= */

function reset() {

    /*
       CORRECCIÓN:
       si ya existía un bucle de animación,
       se cancela antes de crear uno nuevo.
    */

    if (
        animationFrameId !== null
    ) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    state.running = true;

    state.paused = false;

    state.gameOver = false;

    state.lives = 3;

    state.time = 360;

    state.distance = 0;

    state.score = 0;

    state.coins = 0;

    state.lane = 1;

    state.laneVisual = 1;

    state.jump = 0;

    state.crouch = false;

    state.sprinting = false;

    state.invuln = 0;

    state.objects = [];

    state.nextSpawn = 0.7;

    state.ash = 0;

    state.shake = 0;

    state.animationTime = 0;

    state.frame = 0;

    collected.clear();

    renderList();

    updateHUD();

    $("inicio")
        .classList
        .add("oculto");

    $("juego")
        .classList
        .remove("oculto");

    $("pausaPanel")
        .classList
        .add("oculto");

    $("finalPanel")
        .classList
        .add("oculto");

    last = performance.now();

    animationFrameId =
        requestAnimationFrame(
            loop
        );
}


$("btnIniciar").onclick = reset;


/* =========================================================
   PAUSA
========================================================= */

$("btnPausa").onclick = () => {

    if (
        state.running &&
        !state.gameOver
    ) {

        state.paused = true;

        $("pausaPanel")
            .classList
            .remove("oculto");
    }
};


$("btnContinuar").onclick = () => {

    state.paused = false;

    $("pausaPanel")
        .classList
        .add("oculto");

    last = performance.now();
};


$("btnReiniciarPausa").onclick =
    reset;


$("btnMenuPausa").onclick =
    () => {

        location.href =
            "menu.html";
    };


$("btnReintentar").onclick =
    reset;


$("btnMenuFinal").onclick =
    () => {

        location.href =
            "menu.html";
    };


/* =========================================================
   LISTA
========================================================= */

$("btnLista").onclick =
    () => {

        $("listaPanel")
            .classList
            .toggle("oculto");
    };


$("cerrarLista").onclick =
    () => {

        $("listaPanel")
            .classList
            .add("oculto");
    };


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    $("vidas").textContent =
        state.lives;


    const minutes =
        Math.max(
            0,
            Math.floor(
                state.time / 60
            )
        );


    const seconds =
        Math.max(
            0,
            Math.floor(
                state.time % 60
            )
        );


    $("tiempo").textContent =
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(seconds)
            .padStart(2, "0");


    $("puntos").textContent =
        state.score;


    $("monedas").textContent =
        state.coins;


    const progress =
        Math.min(
            100,
            state.distance
        );


    $("porcentaje").textContent =
        Math.floor(progress) +
        "%";


    $("rutaProgreso").style.width =
        progress +
        "%";


    $("marcadorRuta").style.left =
        progress +
        "%";
}


/* =========================================================
   PERSPECTIVA
========================================================= */

function roadWidth(z) {

    return W * 0.12 +
        (
            W * 0.78 -
            W * 0.12
        ) *
        Math.pow(
            z,
            0.75
        );
}


function laneX(
    lane,
    z
) {

    return W / 2 +
        (
            lane - 1
        )
        *
        (
            roadWidth(z) /
            3
        );
}


/* =========================================================
   OBJETOS
========================================================= */

function spawn(
    type,
    lane,
    z = 0.02
) {

    state.objects.push({

        type,
        lane,
        z,

        hit: false,
        passed: false
    });
}


function randomItem() {

    const available =
        items.filter(
            item =>
                !collected.has(
                    item.id
                )
        );


    if (
        !available.length
    ) {

        return "caja";
    }


    return available[
        Math.floor(
            Math.random() *
            available.length
        )
    ].id;
}


function spawnWave() {

    const r =
        Math.random();


    const lane =
        Math.floor(
            Math.random() *
            3
        );


    if (
        r < 0.25
    ) {

        spawn(
            "piedra",
            lane,
            0.02
        );

    } else if (
        r < 0.45
    ) {

        spawn(
            "barrera",
            lane,
            0.01
        );

    } else if (
        r < 0.78
    ) {

        spawn(
            randomItem(),
            lane,
            0.01
        );

    } else {

        spawn(
            "arbol",
            lane === 1
                ? 0
                : lane,
            0.01
        );
    }
}


function projectSize(
    z,
    base
) {

    return base *
        (
            0.25 +
            z * 1.55
        );
}


function drawImageContain(
    img,
    x,
    y,
    w,
    h,
    alpha = 1
) {

    if (
        !img ||
        !img.complete ||
        !img.naturalWidth
    ) {

        return false;
    }


    ctx.save();

    ctx.globalAlpha =
        alpha;


    ctx.drawImage(
        img,
        x - w / 2,
        y - h,
        w,
        h
    );


    ctx.restore();

    return true;
}


/* =========================================================
   FONDO Y CARRETERA
   NO SE CAMBIA
========================================================= */

function drawBackground() {

    const horizon =
        H * 0.39;


    /* CIELO */

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H * 0.48
        );


    sky.addColorStop(
        0,
        "#27383c"
    );


    sky.addColorStop(
        1,
        "#c4ae89"
    );


    ctx.fillStyle =
        sky;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* MONTAÑAS */

    ctx.fillStyle =
        "#1b2929";


    ctx.beginPath();


    ctx.moveTo(
        0,
        H * 0.34
    );


    ctx.lineTo(
        W * 0.18,
        H * 0.18
    );


    ctx.lineTo(
        W * 0.38,
        H * 0.33
    );


    ctx.lineTo(
        W * 0.53,
        H * 0.14
    );


    ctx.lineTo(
        W * 0.78,
        H * 0.34
    );


    ctx.lineTo(
        W,
        H * 0.22
    );


    ctx.lineTo(
        W,
        H * 0.55
    );


    ctx.lineTo(
        0,
        H * 0.55
    );


    ctx.closePath();

    ctx.fill();


    /* TERRENO */

    ctx.fillStyle =
        "#304238";


    ctx.fillRect(
        0,
        horizon,
        W,
        H - horizon
    );


    /* CARRETERA */

    ctx.fillStyle =
        "#8e765e";


    ctx.beginPath();


    ctx.moveTo(
        W / 2 -
        W * 0.06,
        horizon
    );


    ctx.lineTo(
        W / 2 +
        W * 0.06,
        horizon
    );


    ctx.lineTo(
        W / 2 +
        W * 0.40,
        H
    );


    ctx.lineTo(
        W / 2 -
        W * 0.40,
        H
    );


    ctx.closePath();

    ctx.fill();


    /* BORDES */

    ctx.strokeStyle =
        "#273c32";

    ctx.lineWidth = 7;


    ctx.beginPath();

    ctx.moveTo(
        W / 2 -
        W * 0.06,
        horizon
    );


    ctx.lineTo(
        W / 2 -
        W * 0.40,
        H
    );


    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        W / 2 +
        W * 0.06,
        horizon
    );


    ctx.lineTo(
        W / 2 +
        W * 0.40,
        H
    );


    ctx.stroke();


    /* LÍNEAS */

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const z =
            (
                i / 9 +
                state.distance / 7
            ) % 1;


        const y =
            horizon +
            (
                H - horizon
            )
            *
            Math.pow(
                z,
                1.5
            );


        const len =
            8 +
            z * 45;


        ctx.fillStyle =
            "#e9ba39";


        ctx.fillRect(
            W / 2 -
            W * 0.008,
            y,
            len * 0.18,
            Math.max(
                3,
                z * 9
            )
        );


        ctx.fillRect(
            W / 2 +
            W * 0.008 -
            len * 0.18,
            y,
            len * 0.18,
            Math.max(
                3,
                z * 9
            )
        );
    }


    /* ÁRBOLES */

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const z =
            (
                i * 0.21 +
                state.distance * 0.008
            ) % 1;


        const y =
            horizon +
            (
                H - horizon
            )
            *
            Math.pow(
                z,
                1.6
            );


        const s =
            projectSize(
                z,
                70
            );


        const side =
            i % 2
                ? -1
                : 1;


        drawImageContain(
            imgs.arbol,
            W / 2 +
            side *
            (
                roadWidth(z) / 2 +
                s * 0.8
            ),
            y,
            s,
            s * 1.35,
            0.35 +
            0.65 * z
        );
    }


    /* ZONA SEGURA */

    if (
        state.distance > 88
    ) {

        const q =
            Math.min(
                1,
                (
                    state.distance -
                    88
                ) / 12
            );


        ctx.save();

        ctx.globalAlpha = q;

        ctx.fillStyle =
            "#4edb74";


        ctx.beginPath();


        ctx.ellipse(
            W / 2,
            H * 0.405,
            70 + q * 170,
            18 + q * 12,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.fillStyle =
            "#071c10";


        ctx.font =
            "900 20px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "ZONA SEGURA",
            W / 2,
            H * 0.37
        );


        ctx.restore();
    }
}


/* =========================================================
   BARRERA
========================================================= */

function drawBarrier(
    x,
    y,
    w,
    h
) {

    ctx.save();


    ctx.fillStyle =
        "rgba(0,0,0,.32)";


    ctx.beginPath();


    ctx.ellipse(
        x,
        y + 5,
        w * 0.55,
        h * 0.10,
        0,
        0,
        Math.PI * 2
    );


    ctx.fill();


    const top =
        y -
        h * 0.62;


    const boardH =
        h * 0.24;


    ctx.fillStyle =
        "#252b2b";


    ctx.fillRect(
        x - w * 0.45,
        top + 7,
        w * 0.9,
        boardH + 5
    );


    ctx.fillStyle =
        "#d28a16";


    ctx.fillRect(
        x - w * 0.45,
        top,
        w * 0.9,
        boardH
    );


    ctx.fillStyle =
        "#f3c43c";


    for (
        let i = -2;
        i < 3;
        i++
    ) {

        ctx.save();


        ctx.translate(
            x +
            i * w * 0.22,
            top +
            boardH / 2
        );


        ctx.rotate(
            -0.62
        );


        ctx.fillRect(
            -w * 0.035,
            -boardH * 0.70,
            w * 0.07,
            boardH * 1.40
        );


        ctx.restore();
    }


    ctx.fillStyle =
        "#313737";


    ctx.fillRect(
        x - w * 0.36,
        top + boardH,
        w * 0.10,
        h * 0.48
    );


    ctx.fillRect(
        x + w * 0.26,
        top + boardH,
        w * 0.10,
        h * 0.48
    );


    ctx.fillStyle =
        "#59605e";


    ctx.fillRect(
        x - w * 0.40,
        top + boardH + h * 0.43,
        w * 0.18,
        h * 0.08
    );


    ctx.fillRect(
        x + w * 0.22,
        top + boardH + h * 0.43,
        w * 0.18,
        h * 0.08
    );


    ctx.restore();
}


/* =========================================================
   PIEDRA
========================================================= */

function drawRock(
    x,
    y,
    w,
    h
) {

    ctx.save();


    ctx.fillStyle =
        "rgba(0,0,0,.25)";


    ctx.beginPath();


    ctx.ellipse(
        x,
        y + 4,
        w * 0.55,
        h * 0.14,
        0,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#5f6665";


    ctx.beginPath();


    ctx.moveTo(
        x - w * 0.48,
        y - h * 0.15
    );


    ctx.lineTo(
        x - w * 0.30,
        y - h * 0.55
    );


    ctx.lineTo(
        x + w * 0.08,
        y - h * 0.72
    );


    ctx.lineTo(
        x + w * 0.46,
        y - h * 0.45
    );


    ctx.lineTo(
        x + w * 0.50,
        y - h * 0.08
    );


    ctx.lineTo(
        x + w * 0.20,
        y
    );


    ctx.lineTo(
        x - w * 0.28,
        y
    );


    ctx.closePath();


    ctx.fill();


    ctx.fillStyle =
        "#8b908e";


    ctx.beginPath();


    ctx.moveTo(
        x - w * 0.28,
        y - h * 0.48
    );


    ctx.lineTo(
        x + w * 0.05,
        y - h * 0.63
    );


    ctx.lineTo(
        x + w * 0.20,
        y - h * 0.38
    );


    ctx.lineTo(
        x - w * 0.02,
        y - h * 0.30
    );


    ctx.closePath();


    ctx.fill();


    ctx.restore();
}


/* =========================================================
   OBJETOS
========================================================= */

function drawObjects() {

    for (
        const o
        of state.objects
    ) {

        const z =
            Math.max(
                0,
                Math.min(
                    1,
                    o.z
                )
            );


        const x =
            laneX(
                o.lane,
                z
            );


        const y =
            H * 0.39
            +
            (
                H -
                H * 0.39
            )
            *
            Math.pow(
                z,
                1.55
            );


        const scale =
            0.20 +
            z * 1.5;


        const base =
            o.type === "arbol"
                ? 110
                : o.type === "barrera"
                    ? 100
                    : o.type === "piedra"
                        ? 75
                        : 58;


        const w =
            base * scale;


        const h =
            base * scale;


        if (
            o.type === "piedra"
        ) {

            drawRock(
                x,
                y,
                w,
                h
            );

        } else if (
            o.type === "barrera"
        ) {

            drawBarrier(
                x,
                y,
                w,
                h * 0.78
            );

        } else if (
            o.type === "arbol"
        ) {

            drawImageContain(
                imgs.arbol,
                x,
                y,
                w,
                h * 1.35,
                0.90
            );

        } else {

            drawImageContain(
                imgs[o.type],
                x,
                y,
                w,
                h,
                0.98
            );
        }
    }
}


/* =========================================================
   PERSONAJE ANIMADO
========================================================= */

function getPlayerImage() {

    /*
       SALTO:
       usa 4 imágenes en secuencia.
    */

    if (
        state.jump > 0
    ) {

        const jumpFrame =
            Math.floor(
                state.animationTime * 10
            ) % 4;


        return [
            imgs.saltar1,
            imgs.saltar2,
            imgs.saltar3,
            imgs.saltar4
        ][jumpFrame];
    }


    /*
       CORRER:
       alterna correr1 y correr2.
    */

    if (
        state.sprinting
    ) {

        const runFrame =
            Math.floor(
                state.animationTime * 8
            ) % 2;


        return [
            imgs.correr1,
            imgs.correr2
        ][runFrame];
    }


    /*
       CAMINAR:
       alterna caminar3 y caminar4.
    */

    const walkFrame =
        Math.floor(
            state.animationTime * 5
        ) % 2;


    return [
        imgs.caminar3,
        imgs.caminar4
    ][walkFrame];
}


/* =========================================================
   DIBUJAR PERSONAJE
========================================================= */

function drawPlayer() {

    const img =
        getPlayerImage();


    if (
        !img ||
        !img.complete ||
        !img.naturalWidth
    ) {

        return;
    }


    /*
       EL PERSONAJE SIGUE EL CARRIL.
    */

    const x =
        laneX(
            state.laneVisual,
            0.97
        );


    /*
       TAMAÑO.
    */

    const width =
        Math.min(
            W * 0.24,
            215
        );


    const ratio =
        img.naturalHeight /
        img.naturalWidth;


    let height =
        width * ratio;


    /*
       AGACHARSE.

       Como aún no hay frames
       específicos de agacharse,
       bajamos y comprimimos
       la animación de caminar.
    */

    if (
        state.crouch &&
        state.jump === 0
    ) {

        height *= 0.70;
    }


    /*
       LOS PIES SE APOYAN
       EN LA CARRETERA.
    */

    const groundY =
        H * 0.975;


    /*
       REBOTE MUY PEQUEÑO
       mientras camina/corre.
    */

    let bounce = 0;


    if (
        state.jump === 0
    ) {

        bounce =
            Math.abs(
                Math.sin(
                    state.animationTime * 2
                )
            ) * 2.5;
    }


    /*
       SALTO REAL.
    */

    const jumpHeight =
        state.jump *
        H *
        0.20;


    const y =
        groundY
        -
        jumpHeight
        -
        bounce;


    ctx.save();


    /*
       Parpadeo después del golpe.
    */

    if (
        state.invuln > 0
    ) {

        ctx.globalAlpha =
            0.55 +
            0.25 *
            Math.sin(
                performance.now() / 55
            );
    }


    /*
       Ligera inclinación
       cuando corre.
    */

    if (
        state.sprinting
    ) {

        ctx.translate(
            x,
            y
        );

        ctx.rotate(
            -0.015
        );

        ctx.drawImage(
            img,
            -width / 2,
            -height,
            width,
            height
        );

    } else {

        ctx.drawImage(
            img,
            x - width / 2,
            y - height,
            width,
            height
        );
    }


    ctx.restore();


    /*
       SOMBRA BAJO LOS PIES
    */

    ctx.save();

    ctx.globalAlpha =
        0.28;

    ctx.fillStyle =
        "#000";


    ctx.beginPath();


    ctx.ellipse(
        x,
        groundY + 2,
        width * 0.23,
        width * 0.05,
        0,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();
}


/* =========================================================
   COLISIÓN
========================================================= */

function collision(o) {

    if (
        o.z < 0.76
    ) {

        return false;
    }


    if (
        o.lane !==
        state.lane
    ) {

        return false;
    }


    /*
       SALTO SOBRE PIEDRAS
       Y BARRERAS.
    */

    if (
        state.jump > 0.20
        &&
        (
            o.type === "piedra"
            ||
            o.type === "barrera"
        )
    ) {

        return false;
    }


    /*
       AGACHARSE PARA BARRERA.
    */

    if (
        state.crouch
        &&
        o.type === "barrera"
    ) {

        return false;
    }


    return (
        o.type === "piedra"
        ||
        o.type === "barrera"
    );
}


/* =========================================================
   RECOGER
========================================================= */

function collect(o) {

    if (
        [
            "piedra",
            "barrera",
            "arbol"
        ].includes(
            o.type
        )
    ) {

        return;
    }


    if (
        collected.has(
            o.type
        )
    ) {

        return;
    }


    collected.add(
        o.type
    );


    state.score +=
        100;


    state.coins +=
        5;


    renderList();


    const nombre =
        o.type === "agua"
            ? "AGUA RECOGIDA"
            : (
                items.find(
                    x =>
                        x.id === o.type
                )?.nombre
                ||
                "SUMINISTRO"
            )
            +
            " RECOGIDO";


    showMessage(
        nombre
    );
}


/* =========================================================
   GOLPE
========================================================= */

function hit() {

    if (
        state.invuln > 0
    ) {

        return;
    }


    state.lives--;

    state.invuln =
        1.5;

    state.shake =
        0.25;


    showMessage(
        "OBSTÁCULO: SALTA, AGÁCHATE O CAMBIA DE CARRIL"
    );


    if (
        state.lives <= 0
    ) {

        finish(
            false,
            "Te quedaste sin vidas."
        );
    }
}


/* =========================================================
   MENSAJE
========================================================= */

function showMessage(
    text
) {

    $("mensaje").textContent =
        text;


    $("mensaje")
        .classList
        .add(
            "visible"
        );


    clearTimeout(
        showMessage.timer
    );


    showMessage.timer =
        setTimeout(
            () => {

                $("mensaje")
                    .classList
                    .remove(
                        "visible"
                    );

            },
            1100
        );
}


/* =========================================================
   FINAL
========================================================= */

function finish(
    win,
    text
) {

    state.gameOver =
        true;

    state.running =
        false;


    /*
       CORRECCIÓN:
       cancelar el frame pendiente
       cuando termina la partida.
    */

    if (
        animationFrameId !== null
    ) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId = null;
    }


    $("finalTitulo")
        .textContent =
        win
            ? "¡ZONA SEGURA ALCANZADA!"
            : "MISIÓN TERMINADA";


    $("finalTexto")
        .textContent =
        text
        +
        (
            win
                ? " Has completado la ruta de evacuación."
                : ""
        );


    $("finalPanel")
        .classList
        .remove(
            "oculto"
        );
}


/* =========================================================
   ACTUALIZAR
========================================================= */

function update(dt) {

    if (
        state.paused ||
        state.gameOver
    ) {

        return;
    }


    /* TIEMPO */

    state.time -=
        dt;


    if (
        state.time <= 0
    ) {

        state.time = 0;

        finish(
            false,
            "Se agotó el tiempo de evacuación."
        );

        return;
    }


    /* AVANCE */

    const speed =
        state.sprinting
            ? 0.42
            : 0.28;


    state.distance +=
        dt * speed;


    state.distance =
        Math.min(
            100,
            state.distance
        );


    /*
       CAMBIO DE CARRIL
       MÁS RÁPIDO.
    */

    state.laneVisual +=

        (
            state.lane -
            state.laneVisual
        )
        *
        Math.min(
            1,
            dt * 16
        );


    /*
       TIEMPO DE ANIMACIÓN.

       Esto es lo que hace que
       correr1/correr2 vayan
       alternándose.
    */

    state.animationTime +=
        dt;


    /*
       SALTO
    */

    state.jump =
        Math.max(
            0,
            state.jump -
            dt * 1.8
        );


    /*
       INVULNERABILIDAD
    */

    state.invuln =
        Math.max(
            0,
            state.invuln -
            dt
        );


    /*
       SACUDIDA
    */

    state.shake =
        Math.max(
            0,
            state.shake -
            dt
        );


    /*
       CREAR OBJETOS
    */

    state.nextSpawn -=
        dt;


    if (
        state.nextSpawn <= 0
        &&
        state.distance < 98
    ) {

        spawnWave();


        state.nextSpawn =
            0.70 +
            Math.random() * 0.50;
    }


    /*
       MOVER OBJETOS
    */

    for (
        const o
        of state.objects
    ) {

        o.z +=

            dt *
            (
                0.23 +
                state.distance / 600
            );


        if (
            collision(o)
        ) {

            o.hit = true;

            hit();
        }


        if (
            !o.passed &&
            o.z > 0.83 &&
            ![
                "piedra",
                "barrera",
                "arbol"
            ].includes(
                o.type
            )
        ) {

            collect(o);

            o.passed = true;
        }
    }


    state.objects =
        state.objects.filter(
            o =>
                o.z < 1.08
                &&
                !o.hit
        );


    /* =====================================================
       NUBES / CENIZA
    ===================================================== */

    const intensidad =
        Math.min(
            1,
            Math.max(
                0,
                (
                    state.distance -
                    18
                ) / 65
            )
        );


    state.ash =
        intensidad;


    /*
       LINTERNA
       reduce la neblina.
    */

    if (
        collected.has(
            "linterna"
        )
    ) {

        state.ash *=
            0.52;
    }


    /*
       MÁS PIEDRAS
       CON CENIZA.
    */

    if (
        state.ash > 0.52
        &&
        Math.random()
        <
        dt * 0.45
    ) {

        spawn(
            "piedra",
            Math.floor(
                Math.random() * 3
            ),
            0.01
        );
    }


    /*
       META
    */

    if (
        state.distance >= 100
    ) {

        finish(
            true,
            "Llegaste al punto de seguridad."
        );
    }


    updateHUD();
}


/* =========================================================
   DIBUJAR
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    const sx =
        state.shake
            ? (
                (
                    Math.random() -
                    0.5
                ) * 8
            )
            : 0;


    const sy =
        state.shake
            ? (
                (
                    Math.random() -
                    0.5
                ) * 5
            )
            : 0;


    ctx.save();


    ctx.translate(
        sx,
        sy
    );


    /*
       ORDEN:

       1. carretera
       2. objetos
       3. personaje
       4. ceniza
    */

    drawBackground();

    drawObjects();

    drawPlayer();


    /* =====================================================
       NIEBLA Y NUBES
    ===================================================== */

    if (
        state.ash > 0
    ) {

        const fog =
            ctx.createLinearGradient(
                0,
                0,
                0,
                H
            );


        fog.addColorStop(
            0,
            `rgba(
                55,
                60,
                59,
                ${state.ash * 0.48}
            )`
        );


        fog.addColorStop(
            0.45,
            `rgba(
                105,
                108,
                103,
                ${state.ash * 0.28}
            )`
        );


        fog.addColorStop(
            1,
            `rgba(
                170,
                165,
                150,
                ${state.ash * 0.10}
            )`
        );


        ctx.fillStyle =
            fog;


        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        /*
           NUBES GRANDES
        */

        for (
            let i = 0;
            i < 18;
            i++
        ) {

            const x =
                (
                    i * 173
                    +
                    performance.now() *
                    0.008
                )
                %
                (
                    W + 240
                )
                -
                120;


            const y =
                35
                +
                (
                    i * 63
                )
                %
                (
                    H * 0.45
                );


            const radius =
                38 +
                (
                    i % 5
                ) * 20;


            ctx.fillStyle =
                `rgba(
                    72,
                    77,
                    75,
                    ${state.ash * 0.13}
                )`;


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.fill();
        }


        /*
           CENIZA
        */

        for (
            let i = 0;
            i < 55;
            i++
        ) {

            const x =
                (
                    i * 137
                    +
                    performance.now() *
                    0.025
                )
                %
                W;


            const y =
                (
                    i * 83
                    +
                    performance.now() *
                    0.012
                )
                %
                (
                    H * 0.72
                );


            ctx.fillStyle =
                `rgba(
                    70,
                    75,
                    72,
                    ${state.ash * 0.30}
                )`;


            ctx.beginPath();


            ctx.arc(
                x,
                y,
                1 + i % 4,
                0,
                Math.PI * 2
            );


            ctx.fill();
        }
    }


    /* =====================================================
       LINTERNA
    ===================================================== */

    if (
        collected.has(
            "linterna"
        )
    ) {

        const px =
            laneX(
                state.laneVisual,
                0.97
            );


        const py =
            H * 0.76;


        const light =
            ctx.createRadialGradient(
                px,
                py,
                20,
                px,
                py,
                H * 0.60
            );


        light.addColorStop(
            0,
            "rgba(255,245,190,.24)"
        );


        light.addColorStop(
            0.35,
            "rgba(255,235,160,.10)"
        );


        light.addColorStop(
            1,
            "rgba(255,220,120,0)"
        );


        ctx.fillStyle =
            light;


        ctx.fillRect(
            0,
            H * 0.30,
            W,
            H * 0.70
        );
    }


    ctx.restore();
}


/* =========================================================
   BOTONES
========================================================= */

$("btnIzq").onclick =
    () => {

        state.lane =
            Math.max(
                0,
                state.lane - 1
            );
    };


$("btnDer").onclick =
    () => {

        state.lane =
            Math.min(
                2,
                state.lane + 1
            );
    };


$("btnSaltar").onclick =
    () => {

        if (
            state.jump === 0
        ) {

            state.jump = 1;

            state.animationTime = 0;
        }
    };


$("btnAgachar").onclick =
    () => {

        state.crouch =
            !state.crouch;


        $("btnAgachar")
            .classList
            .toggle(
                "activo",
                state.crouch
            );
    };


/* =========================================================
   CORRER
========================================================= */

const btnCorrer =
    $("btnCorrer");


if (btnCorrer) {

    btnCorrer.addEventListener(
        "pointerdown",
        () => {

            state.sprinting = true;

            btnCorrer
                .classList
                .add(
                    "activo"
                );
        }
    );


    btnCorrer.addEventListener(
        "pointerup",
        () => {

            state.sprinting = false;

            btnCorrer
                .classList
                .remove(
                    "activo"
                );
        }
    );


    btnCorrer.addEventListener(
        "pointercancel",
        () => {

            state.sprinting = false;

            btnCorrer
                .classList
                .remove(
                    "activo"
                );
        }
    );
}


/* =========================================================
   TECLADO
========================================================= */

addEventListener(
    "keydown",
    e => {

        /* IZQUIERDA */

        if (
            [
                "ArrowLeft",
                "a",
                "A"
            ].includes(
                e.key
            )
        ) {

            e.preventDefault();

            state.lane =
                Math.max(
                    0,
                    state.lane - 1
                );
        }


        /* DERECHA */

        if (
            [
                "ArrowRight",
                "d",
                "D"
            ].includes(
                e.key
            )
        ) {

            e.preventDefault();

            state.lane =
                Math.min(
                    2,
                    state.lane + 1
                );
        }


        /* ESPACIO = SALTAR */

        if (
            e.key === " "
        ) {

            e.preventDefault();

            if (
                state.jump === 0
            ) {

                state.jump = 1;

                state.animationTime = 0;
            }
        }


        /* ARRIBA = CORRER */

        if (
            [
                "ArrowUp",
                "w",
                "W",
                "Shift"
            ].includes(
                e.key
            )
        ) {

            e.preventDefault();

            state.sprinting = true;
        }


        /* ABAJO = AGACHARSE */

        if (
            [
                "ArrowDown",
                "c",
                "C"
            ].includes(
                e.key
            )
        ) {

            e.preventDefault();

            state.crouch =
                !state.crouch;


            $("btnAgachar")
                .classList
                .toggle(
                    "activo",
                    state.crouch
                );
        }


        /* ESC = PAUSA */

        if (
            e.key === "Escape"
            &&
            state.running
        ) {

            $("btnPausa").click();
        }
    }
);


/* =========================================================
   SOLTAR CORRER
========================================================= */

addEventListener(
    "keyup",
    e => {

        if (
            [
                "ArrowUp",
                "w",
                "W",
                "Shift"
            ].includes(
                e.key
            )
        ) {

            state.sprinting =
                false;
        }
    }
);


/* =========================================================
   JOYSTICK
========================================================= */

let joy = null;


$("joystick")
    .addEventListener(
        "pointerdown",
        e => {

            joy = {

                x: e.clientX,

                y: e.clientY
            };


            $("joystick")
                .setPointerCapture(
                    e.pointerId
                );
        }
    );


$("joystick")
    .addEventListener(
        "pointermove",
        e => {

            if (!joy) {
                return;
            }


            const dx =
                e.clientX -
                joy.x;


            const dy =
                e.clientY -
                joy.y;


            if (
                Math.abs(dx) > 22
            ) {

                state.lane =
                    Math.max(
                        0,
                        Math.min(
                            2,
                            state.lane +
                            (
                                dx > 0
                                    ? 1
                                    : -1
                            )
                        )
                    );


                joy = null;

            } else if (
                Math.abs(dy) > 22
            ) {

                if (
                    dy < 0 &&
                    state.jump === 0
                ) {

                    state.jump = 1;

                    state.animationTime = 0;

                } else if (
                    dy > 0
                ) {

                    state.crouch =
                        !state.crouch;


                    $("btnAgachar")
                        .classList
                        .toggle(
                            "activo",
                            state.crouch
                        );
                }


                joy = null;
            }
        }
    );


$("joystick")
    .addEventListener(
        "pointerup",
        () => {

            joy = null;
        }
    );


/* =========================================================
   BUCLE PRINCIPAL
========================================================= */

let last =
    performance.now();


function loop(now) {

    if (
        !state.running
    ) {

        animationFrameId = null;

        return;
    }


    const dt =
        Math.min(
            0.04,
            (now - last) / 1000
        );


    last = now;


    update(dt);

    draw();


    if (
        state.running
    ) {

        animationFrameId =
            requestAnimationFrame(
                loop
            );

    } else {

        animationFrameId = null;
    }
}