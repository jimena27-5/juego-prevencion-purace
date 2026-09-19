// ==========================================
// SISTEMA DE MONEDAS
// ==========================================

let monedas =
    Number(
        localStorage.getItem("monedasPurace")
    );

if (!Number.isFinite(monedas)) {
    monedas = 50;

    localStorage.setItem(
        "monedasPurace",
        monedas
    );
}

const textoMonedas =
    document.getElementById("monedas");

textoMonedas.textContent = monedas;


// ==========================================
// JUEGO 1
// ==========================================

document
    .getElementById("juego1")
    .addEventListener("click", function () {

        window.location.href =
            "trivia.html";
    });


// ==========================================
// JUEGO 2
// ==========================================

document
    .getElementById("juego2")
    .addEventListener("click", function () {

        window.location.href =
            "huida.html";
    });


// ==========================================
// JUEGO 3
// ==========================================

document
    .getElementById("juego3")
    .addEventListener("click", function () {

        window.location.href =
            "parejas.html";
    });


// ==========================================
// RULETA
// ==========================================

const botonRuleta =
    document.getElementById("ruleta");

const ruletaVisual =
    document.getElementById("ruletaVisual");

const mensajePremio =
    document.getElementById("premio");


// ==========================================
// CONFIGURACIÓN
// ==========================================

const premios = [
    5,
    10,
    15,
    20,
    25
];

const MAX_GIROS = 3;

const TIEMPO_ESPERA =
    3 * 60 * 60 * 1000;


// ==========================================
// DATOS GUARDADOS
// ==========================================

let giros =
    Number(
        localStorage.getItem(
            "ruletaGirosPurace"
        )
    ) || 0;


let bloqueoHasta =
    Number(
        localStorage.getItem(
            "ruletaBloqueoPurace"
        )
    ) || 0;


// ==========================================
// ESTADO
// ==========================================

let girando = false;

let rotacionActual =
    Number(
        ruletaVisual.dataset.rotacion
    ) || 0;


// ==========================================
// COMPROBAR BLOQUEO
// ==========================================

function comprobarRuleta() {

    const ahora =
        Date.now();


    // Si todavía está dentro
    // de las 3 horas.

    if (
        bloqueoHasta > ahora
    ) {

        bloquearRuleta();

        actualizarTiempoRestante();

        return;
    }


    // Ya pasaron las 3 horas:
    // vuelve a tener 3 giros.

    if (
        bloqueoHasta !== 0 &&
        bloqueoHasta <= ahora
    ) {

        giros = 0;

        bloqueoHasta = 0;


        localStorage.removeItem(
            "ruletaGirosPurace"
        );

        localStorage.removeItem(
            "ruletaBloqueoPurace"
        );


        desbloquearRuleta();
    }


    // Si ya gastó los tres giros
    // y todavía no hay bloqueo,
    // bloquear y comenzar las 3 horas.

    if (
        giros >= MAX_GIROS
    ) {

        iniciarBloqueo();

        return;
    }


    desbloquearRuleta();
}


// ==========================================
// BLOQUEAR
// ==========================================

function bloquearRuleta() {

    botonRuleta.disabled = true;

    botonRuleta.style.pointerEvents =
        "none";

    botonRuleta.style.opacity =
        "0.55";

    botonRuleta.style.cursor =
        "not-allowed";
}


// ==========================================
// DESBLOQUEAR
// ==========================================

function desbloquearRuleta() {

    botonRuleta.disabled = false;

    botonRuleta.style.pointerEvents =
        "";

    botonRuleta.style.opacity =
        "";

    botonRuleta.style.cursor =
        "";

    mensajePremio.classList.remove(
        "mostrar"
    );
}


// ==========================================
// COMENZAR ESPERA DE 3 HORAS
// ==========================================

function iniciarBloqueo() {

    bloqueoHasta =
        Date.now() +
        TIEMPO_ESPERA;


    localStorage.setItem(
        "ruletaBloqueoPurace",
        bloqueoHasta
    );


    bloquearRuleta();

    actualizarTiempoRestante();
}


// ==========================================
// TIEMPO RESTANTE
// ==========================================

function actualizarTiempoRestante() {

    const intervalo =
        setInterval(
            function () {

                const ahora =
                    Date.now();

                const restante =
                    bloqueoHasta -
                    ahora;


                if (
                    restante <= 0
                ) {

                    clearInterval(
                        intervalo
                    );


                    giros = 0;

                    bloqueoHasta = 0;


                    localStorage.removeItem(
                        "ruletaGirosPurace"
                    );

                    localStorage.removeItem(
                        "ruletaBloqueoPurace"
                    );


                    desbloquearRuleta();


                    mensajePremio.textContent =
                        "RULETA DISPONIBLE";


                    mensajePremio
                        .classList
                        .add(
                            "mostrar"
                        );


                    return;
                }


                const horas =
                    Math.floor(
                        restante /
                        (
                            1000 *
                            60 *
                            60
                        )
                    );


                const minutos =
                    Math.floor(
                        (
                            restante %
                            (
                                1000 *
                                60 *
                                60
                            )
                        ) /
                        (
                            1000 *
                            60
                        )
                    );


                const segundos =
                    Math.floor(
                        (
                            restante %
                            (
                                1000 *
                                60
                            )
                        ) /
                        1000
                    );


                mensajePremio.textContent =
                    "RULETA BLOQUEADA · " +
                    String(horas).padStart(2, "0") +
                    ":" +
                    String(minutos).padStart(2, "0") +
                    ":" +
                    String(segundos).padStart(2, "0");


                mensajePremio
                    .classList
                    .add(
                        "mostrar"
                    );

            },
            1000
        );
}


// ==========================================
// GIRO DE RULETA
// ==========================================

botonRuleta.addEventListener(
    "click",
    function () {

        if (
            girando ||
            botonRuleta.disabled
        ) {

            return;
        }


        // Verificar antes de girar.

        comprobarRuleta();


        if (
            bloqueoHasta > Date.now()
        ) {

            return;
        }


        if (
            giros >= MAX_GIROS
        ) {

            iniciarBloqueo();

            return;
        }


        girando = true;


        botonRuleta.classList.add(
            "ruleta-girando"
        );


        // ======================================
        // DECIDIR PREMIO
        // ======================================

        const indiceGanador =
            Math.floor(
                Math.random() *
                premios.length
            );


        const premioGanado =
            premios[
                indiceGanador
            ];


        // ======================================
        // CALCULAR POSICIÓN
        // ======================================

        const gradosPorPremio =
            360 /
            premios.length;


        const centroSector =
            (
                indiceGanador *
                gradosPorPremio
            ) +
            (
                gradosPorPremio / 2
            );


        // 5 vueltas completas
        // antes de detenerse.

        const vueltas =
            5 * 360;


        const giroFinal =
            vueltas +
            (
                360 -
                centroSector
            );


        const nuevaRotacion =
            rotacionActual +
            giroFinal;


        rotacionActual =
            nuevaRotacion;


        ruletaVisual.dataset.rotacion =
            nuevaRotacion;


        // ======================================
        // GIRAR
        // ======================================

        ruletaVisual.style.transform =
            `rotate(${nuevaRotacion}deg)`;


        // ======================================
        // ESPERAR A QUE TERMINE
        // ======================================

        setTimeout(
            function () {


                // =================================
                // SUMAR EL PREMIO
                // =================================

                monedas +=
                    premioGanado;


                localStorage.setItem(
                    "monedasPurace",
                    monedas
                );


                textoMonedas.textContent =
                    monedas;


                // =================================
                // CONTAR GIRO
                // =================================

                giros++;


                localStorage.setItem(
                    "ruletaGirosPurace",
                    giros
                );


                // =================================
                // MOSTRAR PREMIO
                // =================================

                mensajePremio.textContent =
                    "+ " +
                    premioGanado +
                    " MONEDAS";


                mensajePremio
                    .classList
                    .remove(
                        "mostrar"
                    );


                void mensajePremio.offsetWidth;


                mensajePremio
                    .classList
                    .add(
                        "mostrar"
                    );


                girando = false;


                botonRuleta
                    .classList
                    .remove(
                        "ruleta-girando"
                    );


                // =================================
                // DESPUÉS DEL TERCER GIRO
                // =================================

                if (
                    giros >= MAX_GIROS
                ) {

                    setTimeout(
                        function () {

                            iniciarBloqueo();

                        },
                        1800
                    );
                }


            },
            4300
        );

    }
);


// ==========================================
// SALIR
// ==========================================

document
    .getElementById("salir")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );


// ==========================================
// COMPROBAR AL ABRIR EL MENÚ
// ==========================================

comprobarRuleta();