const musicNotes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b","c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
const chordPicker = document.getElementById("chord");
const addChordButton = document.getElementById("showChord");
const guitarTunner = document.getElementById('tunner');
const addTunningButton = document.getElementById('showTunning')



class GuitarNote{
  constructor(note, stringId){
    this.note = note;
    this.stringId = stringId;
    this.el = document.createElement('td');
    this.el.textContent = this.note;
  }
}

class GuitarString{
  constructor(notes, id){
    this.notes = notes;
    this.id = id;
    this.el = document.createElement('tr');
  }
  mountString(){
    this.notes.forEach(note => this.el.appendChild(note.el));
  }
}

class GuitarBuilder{

  buildGuitar(tunning){
    let _guitar = [];

    tunning.forEach((tune, index)=>{
        _guitar.push(this.buildGuitarString(tune, index))
    });
    return new Guitar(_guitar);
  }
  
  buildGuitarString(baseNote, index){

    let _musicNotes = [...musicNotes];
    let _temp = _musicNotes.splice(_musicNotes.indexOf(baseNote));
    let arrangedNotes = _temp.concat(_musicNotes);
    let _guitarString = [];
    arrangedNotes.forEach(note =>{
        _guitarString.push(this.buildGuitarNote(note, index))
    })
    
    return new GuitarString(_guitarString, index);
  }
  
  buildGuitarNote(note, i){
    return new GuitarNote(note, i);
  }
  
}

class Guitar{
  constructor(guitareStrings){
    this.el = document.createElement('table');
    this.guitareStrings = guitareStrings;
  }

  mountGuitar(){
    for (let i = this.guitareStrings.length-1; i >=0 ; i--) {
        const element = this.guitareStrings[i];
        element.mountString();
        this.el.appendChild(element.el);
    }
  }

  showOnNeck(_notes){
    this.el.querySelectorAll('.preview').forEach(element => element.classList.remove('preview', 'key'));

    for(let i = 0; i < _notes.length; i++){
      this.guitareStrings.forEach(guitareString => {
        guitareString.notes.forEach(n => {
          if(n.note === _notes[i])n.el.classList.add('preview');
          if(i === 0 && n.note === _notes[i])n.el.classList.add('key');
        });
      })
    }
  }

}

class Chord{
  constructor(chordName, chordAbreviation){
    this.chordName = chordName;
    this.chordAbreviation = chordAbreviation;
    this.chordNotes = [];
    this.el = document.createElement('div');
    this.el.innerHTML = this.render();
    this.el.addEventListener('click', (e)=>{
      document.querySelectorAll('.active').forEach(element=>element.classList.remove('active'));
      this.getComputedNotes();
      this.showOnNeck();
      this.el.classList.add('active');

    });
    this.el.querySelector('button').addEventListener('click', (e)=>{
      e.stopPropagation();
      if(this.el.classList.contains('active')){
        document.querySelectorAll('.preview').forEach(element=>element.classList.remove('preview', 'key'));
      }
      document.getElementById('chords').removeChild(this.el);
    });
  }

  render(){
    return`
    <span>${this.chordAbreviation}</span>
    <button>x</button>
    `
  }
  getComputedNotes(){
    this.chordNotes = guitarManager.computeChord(this.chordName);
  }
  showOnNeck(){
    guitarManager.showOnNeck(this.chordNotes)
  }
}

class GuitarManager{
  constructor(){
    this.guitars = [];
    this.guitarBuilder = new GuitarBuilder();
    this.el = document.getElementById('guitarBoards');
  }

  buildGuitar(tunning){
    this.guitars.push(this.guitarBuilder.buildGuitar(tunning))
    this.displayGuitars();
  }

  displayGuitars(){
    this.el.innerHTML = "";
    this.guitars.forEach(guitar => {
      guitar.mountGuitar();
      this.el.appendChild(guitar.el)
    });
  }
  computeChord(chordName){
    const chordNameParts = chordName.split('-');
    const chordKey = chordNameParts[0];
    const third = chordNameParts[1];
    const fifth = chordNameParts[3]? chordNameParts[3] : "5th";
    const seventh = chordNameParts[2]? chordNameParts[2] : null;
    function findChordNotes(_musicNotes){
      let chordNotes = [chordKey];
      let firstNoteIndex = _musicNotes.findIndex(el=> el === chordKey);
      if(third === "major")chordNotes.push(_musicNotes[firstNoteIndex+4])
      else chordNotes.push(_musicNotes[firstNoteIndex+3])
      if(fifth === "5b")chordNotes.push(_musicNotes[firstNoteIndex+6])
      else chordNotes.push(_musicNotes[firstNoteIndex+7])
      if(seventh && seventh === "7maj")chordNotes.push(_musicNotes[firstNoteIndex+11])
      else if(seventh && seventh === "7min")chordNotes.push(_musicNotes[firstNoteIndex+10])
      return chordNotes;
    }
    return findChordNotes(musicNotes); 
  }
  showOnNeck(notes){
    this.guitars.forEach(guitar=>guitar.showOnNeck(notes));
  }

}
let guitarManager = new GuitarManager();

guitarManager.buildGuitar(["e","a","d","g","b","e"]);


addChordButton.addEventListener('click', ()=>{
  const chord = new Chord(chordPicker.value, chordPicker.options[chordPicker.selectedIndex].text);
  
  document.getElementById('chords').appendChild(chord.el);
});

addTunningButton.addEventListener('click', (e)=>{

  let notes = guitarTunner.value.split("-");
  if(validateTunning(notes) && notes.length >=4){
    if(guitarTunner.classList.contains('error')){
      guitarTunner.classList.remove('error');
      document.getElementById('error-message').style.display = "none";
    }
    guitarManager.buildGuitar(notes);
    guitarTunner.value = "";
  }else{
    guitarTunner.classList.add('error');
    document.getElementById('error-message').style.display = "block";
  }
  
});

function validateTunning(tunning){
  let valid = true;
  for (let i = 0; i < tunning.length; i++){
    if(!musicNotes.find(element=> element === tunning[i])){
      valid = false;
      return;
    }
  }
  return valid
}