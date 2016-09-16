var elm = document.getElementById('sortable');
var sortable = Sortable.create(elm);

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}

function findById(source, id) {
  return source.filter(function(obj) {
    return obj.id == id;
  })[0];
}

function getTotalDuration(source) {
  return source.reduce(function(a, b) {
    return a + b["duration"];
  }, 0);
};

function getStressScore(source) {
  var d = getTotalDuration(source);
  var n = source.reduce(function(a, b) {
    return a + b["_tp"];
  }, 0);
  console.log(d, n, Math.pow((n/d), 0.25));
  
  return Math.pow((n/d), 0.5) * 100  * d/60;
}

(function(exports) {
  exports.app = new Vue({
    el: '#todoapp',
    data: {
      tasks: [{
        id: 0,
        message: 'Warmup',
        duration: 15,
        power: 50,
        type: 'steady',
        _tp: 7.5,
      }, {
        id: 1,
        message: '60 RPM (stand up)',
        duration: 5,
        power: 50,
        type: 'steady',
        _tp: 2.5,
      }, {
        id: 2,
        message: '60 RPM (stand up)',
        intOnDuration: 5,
        intOnPower: 120,
        intOffDuration: 5,
        intOffPower: 50,
        intRepeats: 4,
        type: 'interval',
        duration: 40,
        _tp: 34,
      }, {
        id: 3,
        message: 'Cooldown',
        duration: 10,
        power: 50,
        type: 'steady',
        _tp: 5,
      }],
      id: 6,
      newTask: '',
      Power: 50,
      duration: 5,
      workout_name: "Program4",
      author: "Juan Pelota",
      message: "Steady",
      intDescr: "",
      intOnDuration: 5,
      intOnPower: 120,
      intOffDuration: 5,
      intOffPower: 50,
      intRepeats: 4,
      type: 'steady',
      total_duration: 70,
      stress_score: 0,
    },

    methods: {
      removeTodo: function(index) {
        this.tasks.splice(index, 1)
        this.total_duration = getTotalDuration(this.tasks);
        this.stress_score = getStressScore(this.tasks);
      },

      saveData: function(e) {
        console.log("Saving....");
        var a = document.createElement('a');
        a.href = 'data:plain/text,' + encodeURIComponent(JSON.stringify(this.tasks));
        a.download = 'data.json';
        a.innerHTML = 'download JSON';

        var container = document.getElementById('container');

        var doc = document.implementation.createDocument(null, "workout_file", null);
        var workoutElement = doc.createElement("workout");
        var author = doc.createTextNode(this.author);
        var author_node = doc.createElement("author");
        var name_node = doc.createElement("name");
        author_node.appendChild(author);
        doc.documentElement.appendChild(author_node);
        var name = doc.createTextNode(this.workout_name);
        name_node.appendChild(name);
        var desc_node = doc.createElement("description");
        doc.documentElement.appendChild(desc_node);
        doc.documentElement.appendChild(name_node);
        var order = sortable.toArray();
        console.log("iterating....", order);

        for (var i = 0; i < order.length; i++) {
          var obj = findById(this.tasks, order[i]);
          var text1 = doc.createElement("textevent");
          text1.setAttribute("timeoffset", 0);
          if (obj.type == 'steady') {
            var msg = "" + obj.message + " for " + obj.duration + " min";
            text1.setAttribute("message", msg);
            var step = doc.createElement("SteadyState");
            step.setAttribute("Duration", obj.duration * 60);
            step.setAttribute("Power", obj.power / 100);
          }
          if (obj.type == 'interval') {
            var msg = obj.message;
            text1.setAttribute("message", msg);
            var step = doc.createElement("IntervalsT");
            step.setAttribute("Repeat", obj.intRepeats);
            step.setAttribute("OnDuration", obj.intOnDuration * 60);
            step.setAttribute("OnPower", obj.intOnPower / 100);
            step.setAttribute("OffDuration", obj.intOffDuration * 60);
            step.setAttribute("OffPower", obj.intOffPower / 100);
          }
          step.appendChild(text1);
          workoutElement.appendChild(step);
        }
        console.log("almost there....");
        doc.documentElement.appendChild(workoutElement);
        //console.log(sortable.toArray());
        download(this.workout_name + '.zwo', new XMLSerializer().serializeToString(doc));
      },

      addInterval: function(e) {
        e.preventDefault();
        var task = {
          id: this.id++,
          message: this.intDescr,
          intOnDuration: this.intOnDuration,
          intOnPower: this.intOnPower,
          intOffDuration: this.intOffDuration,
          intOffPower: this.intOffPower,
          intRepeats: this.intRepeats,
          type: 'interval',
          duration: (this.intOnDuration + this.intOffDuration) * this.intRepeats,
          _tp: (Math.pow(this.intOnPower/100, 4) * this.intOnDuration +
            Math.pow(this.intOffPower/100, 4) * this.intOffDuration) * this.intRepeats,
        };
        this.tasks.push(task);
        this.total_duration = getTotalDuration(this.tasks);
        this.stress_score = getStressScore(this.tasks);
      },

      addTask: function(e) {
        e.preventDefault();
        var task = {
          id: this.id++,
          message: this.message,
          duration: this.duration,
          power: this.Power,
          type: 'steady',
          _tp: this.duration * Math.pow(this.Power/100, 4),
        };
        this.tasks.push(task);
        this.total_duration = getTotalDuration(this.tasks);
        this.stress_score = getStressScore(this.tasks);
      }
    }
  });
}(window));