
const Sequelize = require('sequelize');

const{log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');



/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Commandos:");
    log(" h|help  - Muestra esta ayuda.");
    log( " list - Listar los quizzes existentes.");
    log("show <id> - Muestra la pregunta y la respuesta el P2_Quiz indicado. ");
    log("add - Añadir un nuevo P2_Quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.\n");
    log("test <id> - Probar el quiz indicado.");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes.\n");
    log("credits - Créditos.");
    log("q|quit - Salir del programa.");
    rl.prompt();
};


/**
 * Listar los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.listCmd = rl =>{
    models.quiz.findAll()
        .each(quiz => {
        log(`  [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);


})
    .catch(error => {
        errorlog(error.message);
})


    .then(() => {
        rl.prompt();
});
};


/**
 * Esta funcion devuelve una promesa que:
 *  - Valida que se ha introducido un valor para el parametro.
 *  - Convierte el parametro en un numero entero.
 * Si todo va bien, la promesa se satisface y devuelve el valor de id a usar.
 * @param id Parametro con el índice a validar.
 */

const validateId = id =>{
    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id === "undefined") {
            reject(new Error ('Falta el parametro <id>.'));
    } else {
            id = parseInt(id);  // coger la parte entera y descartar lo demas
            if (Number.isNaN(id)){
                reject(new Error('El valor del parámetro<id> no es un número.'));
            } else {
                resolve(id);
            }

    }
    });
};



/**
 * Muestra el P2_Quiz indicando en el parámetro: la pregunta y la respuesta.
 *
 * @param id Clave del quiz a mostrar.
 */

exports.showCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error('No existe un quiz asociado al id=${id}.');
    }
    log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

        })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });



};








const makeQuestion = (rl,text) => {

    return new Sequelize.Promise((resolve,reject) => {
        rl.question(colorize(text, 'red'), answer => {

    });
    });
};
/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 */

exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta:')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta')
                .then(a => {
                    return {question: q, answer: a};
            });
    })
    .then(quiz => {
        return models.quiz.create(quiz);
    })
    .then((quiz)=> {
        log(` ${colorize(' Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>','magenta')}${answer}`);

    })
    .catch(Sequelize.ValidationError, error => {
         errorlog('El quiz es erroneo:');
         error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};



/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */

exports.deleteCmd = (rl,id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });






};


/**
 * Edita un quiz del modelo.
 *
 * @param id Clave del quiz a editar en el modelo.
 */

exports.editCmd = (rl,id) =>{
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error('No existe un quiz asociado al id=${id}.');
    }

    process.stdout.isTTY && setTimeout(() =>{rl.write(quiz.question)},0);
    return makeQuestion(rl, ' Introduzca la pregunta: ')
        .then(q =>{
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
            return makeQuestion(rl, 'Introduzca la respuesta')
                .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
});

});

})

.then(quiz => {
    return quiz.save();
})
.then(quiz => {
    log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${answer}`);
})

.catch(Sequelize.ValidationError,error => {
    errorlog('El quiz es erroneo:');
    error.errors.forEach(({message}) => errorlog(message));
})
.catch(error =>{
    errorlog(error.message);
})
.then(() => {
    rl.prompt();
});
};




/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param id Clave del quiz a probar.
 */

exports.testCmd =(rl,id)  => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else
        try {

            const quiz = model.getByIndex(id);

            rl.question(`${colorize(quiz.question, 'red')}${colorize('? ', 'red')}`, respuesta => {

                const resp = quiz.answer;

            if (respuesta.trim().toLowerCase() === resp.trim().toLowerCase()) {
                log('Su respuesta es correcta.')
                log("Correcta", "green")
                rl.prompt();
            } else {
                log('Su respuesta es incorrecta.')
                log("Inorrecta", "red")
                rl.prompt();
            }
        });


        }catch(error){
    errorlog(error.message);
    rl.prompt();
   }

};
/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 */

exports.playCmd = rl => {
    let score = 0;
    let toBePlayed = [];

    models.quiz.findAll({raw:true})
        .then(quizzes => {
            toBePlayed = quizzes;
    })


        const playOne = () => {
            return Promise.resolve()
                .then(() => {


                    if(toBePlayed.lenght <= 0){
            console.log("SE ACABO");
            return;
        }

        let pos =Math.floor(Math.random()*toBePlayed.length);
                    let quiz = toBePlayed[pos];
                    toBePlayed.splice(pos,1);

                    return makeQuestion(rl,quiz.question)
                        .then(answer => {
                        if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()
    )
        {
            score++;
            console.log("chachi");
            return playOne();
        }
    else
        {
            console.log("CACA");
        }
    })
    })
    }

    models.quiz.findAll({raw:true})
        .then(quizzes => {
        toBePlayed = quizzes;
})

    .then(() => {
    return playOne();
})

    .catch(e => {
    console.log("Error: " + e);
})
    .then(() => {
    console.log(score);
    rl.prompt();
})
};
/**
 * Muestra los nombres de los autores de la práctica.
 */

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('MARIA', 'green');
    rl.prompt();


};


/**
 * Terminar el programa.
 */

exports.quitCmd = rl => {
    rl.close();

};


