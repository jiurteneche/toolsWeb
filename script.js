var app = new Vue({
  el: '#app',
  data: {
    //Vue para las tareas
    title: "",
    description: "",
    priority: "",
    creationDate: "",
    cardId: 0,
    totalTasks: 0,
    //Vue para la calculadora
    numbers: [{
        name: "zeroo",
        value: 0
      }, {
        name: "one",
        value: 1
      }, {
        name: "two",
        value: 2
      }, {
        name: "three",
        value: 3
      }, {
        name: "four",
        value: 4
      }, {
        name: "five",
        value: 5
      }, {
        name: "six",
        value: 6
      }, {
        name: "seven",
        value: 7
      }, {
        name: "eight",
        value: 8
      }, {
        name: "nine",
        value: 9
      }, {
        name: "float",
        value: "."
      }
    ],
    ops: [{
      name: "plus",
      value: "+"
    }, {
      name: "minus",
      value: "-"
    }, {
      name: "by",
      value: "*"
    }, {
      name: "divided",
      value: "/"
    }],
    actions: [{
      name: "equal",
      value: "="
    }, {
      name: "clear",
      value: "C"
    }, {
      name: "backspace",
      value: "<<"
    }],
    output: [],
  },
  methods: {

    //Primero están los métodos referentes al anotador de tareas

    //Esta función sirve para calcular la fecha del día
    date() {

      var months = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
      var date = new Date();
      this.creationDate = (date.getDate() + " de " + months[date.getMonth()] + " de " + date.getFullYear());

    },

    //Esta función guarda las tareas que se vayan agregando dentro de firebase
    addTaskCard() {

      this.cardId += 1;

      this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1);
      this.description = this.description.charAt(0).toUpperCase() + this.description.slice(1);

      this.date();

      //Todo lo que está en VUE hay que colocarlo en firebase (con las funciones que ofrece firebase)
      firebase.database().ref("tasks/" + this.cardId).set({
        title: this.title,
        description: this.description,
        priority: this.priority,
        creationDate: this.creationDate,
        cardId: this.cardId,
      });

      //Una vez que eso que estaba en VUE fue colocado en firebase (paso anterior), VUE se "limpia"
      this.title = "";
      this.description = "";
      this.priority = "";
      this.creationDate = "";
    },

    //Esta función va a Firebase, lee lo que hay e imprime (trae) lo que estoy buscando, lo que le especifico
    getAndPrintFirebaseData() {

      //Esto es para ir a buscar los datos a firebase
      var db = firebase.database().ref("tasks/");
      db.on('child_added', hijo => {

        //La variable valorDelHijo almacena ese objeto json (con su id, title, description, priority y creationDate) que se cargó en Firebase por cada tarea agregada
        var valorDelHijo = hijo.val();

        //Suma 1 al contador de tareas
        this.totalTasks += 1;

        //Esto hace que el app.cardId NO se me vuelva a 0 cuando recargo la página (y, por lo tante, se rompa)
        this.cardId += this.totalTasks + 1;

        //A partir de acá empezamos a imprimir
        var currentPriority = "";

        if (valorDelHijo.priority == "alta") {
          currentPriority = "danger";
        }
        if (valorDelHijo.priority == "media") {
          currentPriority = "warning"
        }
        if (valorDelHijo.priority == "baja") {
          currentPriority = "success"
        }

        document.getElementById("tasksCards").innerHTML +=

          `<div id="${valorDelHijo.cardId}" class="col-10 col-sm-8 col-md-6 col-lg-4" style="margin-bottom: 20px;">
                <div class="card text-center border-${currentPriority}" style="border-width: 4px;">
                      <div class="card-header border-${currentPriority}">
                          
                      </div>
                      <div class="card-body text-${currentPriority}">
                          <h4 class="card-title">${valorDelHijo.title}</h4>
                          <p class="card-text">${valorDelHijo.description}.</p>
                      </div>
                      <div style="margin-bottom: 20px;">
                          <button class="btn btn-${currentPriority}" onclick="deleteCard(${hijo.key})">Desechar</button>
                      </div>
                      <div class="card-footer text-muted border-${currentPriority}">
                          ${valorDelHijo.creationDate}
                      </div>
                </div>
            </div>`

      })
    },

    // A partir de acá están los métodos referentes al funcionamiento de la calculadora

    //Esta función imprime cada número que se presiona en la calculadora en su output
    print(key) {

      if (this.output.includes("SyntaxError")) {
        this.output = [];
      }

      this.output.push(key.value);
    },

    clear() {
      this.output = [];
    },

    backspace() {

      if (this.output.includes("SyntaxError")) {
        this.output = [];
      } else {
        this.output.pop();
      }
    },

    equal() {
      try {
        this.output = [eval(this.output.join(''))];
      } catch (error) {
        this.output = [error.name];
      }
    },

    //Esta función es necesaria para que al presionar un botón de la calculadora, se ejecute la función correspondiente a esa tecla
    //Por ejemplo, si toco C, que se ejecute clear(), si toco <<, que se ejecute backspace(), etc.
    handleFn(fn_name) {
      return this[fn_name]();
    }

  },
});


//MÉTODOS REFERENTES A LAS CARDS

//Llamo a la función fuera de VUE para que se ejecute 
app.getAndPrintFirebaseData();

//Función para eliminar la card de una tarea. Al eliminarse de la base de datos, se elimina tambén del front
function deleteCard(x) {
  firebase.database().ref("tasks/" + x).remove();

  location.reload();
}