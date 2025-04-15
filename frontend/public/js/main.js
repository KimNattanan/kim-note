import { BACKEND_URL } from "./config.js";

let selectingDebounce = null;
const noteSelect = (e)=>{
  const rt = e.target.closest('.note-title');
  if(selectingDebounce && rt.id==selectingDebounce) return;
  selectingDebounce = rt.id;
  setTimeout(()=>{
    if(selectingDebounce == rt.id) selectingDebounce = null;
  }, 500);
  if(rt.classList.contains('selected')) rt.classList.remove('selected');
  else{
    const oldRt = document.getElementById('left-tab').querySelector('.selected');
    if(oldRt) oldRt.classList.remove('selected');
    rt.classList.add('selected');
  }
  refreshDisplayNote();
}
const getSelectedNoteId = ()=>{
  const rt = document.getElementById('left-tab').querySelector('.selected');
  if(!rt) return null;
  return rt.id;
}
const refreshDisplayNote = async()=>{
  const selectedNoteId = getSelectedNoteId();
  const rtab = document.getElementById('right-tab');
  const textarea = rtab.querySelector('textarea');
  if(!selectedNoteId) rtab.className = 'hidden';
  else{
    try{
      const res = await axios.get(`${BACKEND_URL}/notes/${selectedNoteId}`);
      textarea.value = res.data.content;
      rtab.className = '';
      rtab.querySelector('#save-btn').classList.add('transparent');
      console.log('display done');
    }catch(error){
      rtab.className = 'hidden';
      if(error.response) console.error('display error:', error.response.data.errorMessage);
      else console.error('display error:', error);
    }
  }
}
const noteInput = (e)=>{
  const rtab = document.getElementById('right-tab');
  const saveBtn = rtab.querySelector('#save-btn');
  saveBtn.classList.remove('transparent');
}
const noteSave = async(e)=>{
  const rt = document.getElementById('left-tab').querySelector('.selected');
  const rtab = document.getElementById('right-tab');
  const textarea = rtab.querySelector('textarea');
  if(!rt){
    console.error('no selected note found.');
    return;
  }
  try{
    const res = await axios.patch(`${BACKEND_URL}/notes/${rt.id}`, {content: textarea.value});
    console.log('save done:', res.data);
    rtab.querySelector('#save-btn').classList.add('transparent');
  }catch(error){
    if(error.response) console.error('save error:', error.response.data.errorMessage);
    else console.error('save error(2):', error);
  }
}
const noteRename = (e)=>{
  e.stopPropagation();
  const rt = e.target.closest('.note-title');
  const input = rt.querySelector('textarea');
  input.readOnly=false;
  input.focus();
  input.select();
}
const titleOnBlur = async(e)=>{
  e.stopPropagation();
  const rt = e.target.closest('.note-title');
  e.target.readOnly = true;
  try{
    const res = await axios.patch(`${BACKEND_URL}/notes/${rt.id}`, {title: e.target.value});
    console.log('rename done:', res.data);
  }catch(error){
    if(error.response) console.error('rename error:', error.response.data.errorMessage);
    else console.error('rename error(2):', error);
  }
}
const noteDelete = async(e)=>{
  e.stopPropagation();
  const rt = e.target.closest('.note-title');
  try{
    const res = await axios.delete(`${BACKEND_URL}/notes/${rt.id}`);
    await fetchNotes();
    await refreshDisplayNote();
    console.log('delete done:', res.data);
  }catch(error){
    if(error.response) console.error('delete error:', error.response.data.errorMessage);
    else console.error('delete error(2):', error);
  }
}
const createNote = async(e)=>{
  const errBox = document.getElementById('error-container')
  try{
    const res = await axios.post(`${BACKEND_URL}/notes`);
    e.target.className = 'create-note hidden';
    await fetchNotes();
    e.target.className = 'create-note';
    errBox.className = 'hidden';
  } catch (error) {
    errBox.className = ''
    if(error.response) errBox.innerText=error.response.data.errorMessage;
    else errBox.innerText = error;
  }
}
const fetchNotes = async()=>{
  const errBox = document.getElementById('error-container')
  try{
    const res = await axios.get(`${BACKEND_URL}/notes`);
    errBox.className = 'hidden';
    renderNotes(res.data);
  } catch (error) {
    errBox.className = ''
    if(error.response) errBox.innerText = error.response.data.errorMessage;
    else errBox.innerText = error;
  }
}

let createNoteLi=null;
let errBoxLi=null;
const renderNotes = (notes)=>{
  const selectedNoteId = getSelectedNoteId();
  const notesContainer = document.getElementById('left-tab');
  notesContainer.innerHTML = '';
  notes.forEach(note => {
    const li=document.createElement('li');
    li.id=note.id;
    if(selectedNoteId && note.id==selectedNoteId) li.className='note-title selected';
    else li.className='note-title';
    li.addEventListener('click',noteSelect);
    li.addEventListener('dblclick',noteRename);
    const textarea=document.createElement('textarea');
    textarea.className='title';
    textarea.addEventListener('blur',titleOnBlur);
    textarea.readOnly=true;
    textarea.value=note.title;
    const panel=document.createElement('div');
    panel.className='panel';
    const deleteBtn=document.createElement('div');
    deleteBtn.className='delete';
    deleteBtn.addEventListener('click',noteDelete);
    const deleteImg=document.createElement('img');
    deleteImg.src='img/cross.png';
    deleteBtn.appendChild(deleteImg);
    panel.appendChild(deleteBtn);
    li.appendChild(textarea);
    li.appendChild(panel);
    notesContainer.appendChild(li);
  });
  notesContainer.appendChild(createNoteLi);
  notesContainer.appendChild(errBoxLi);
}

document.addEventListener("DOMContentLoaded",()=>{
  const rtab = document.getElementById('right-tab');
  rtab.querySelector('textarea').addEventListener('input', noteInput);
  rtab.querySelector('#save-btn').addEventListener('click', noteSave);
  createNoteLi = document.createElement('li');
  createNoteLi.className = 'create-note';
  createNoteLi.innerText = 'Create Note..';
  createNoteLi.addEventListener('click', createNote);
  errBoxLi = document.createElement('li');
  errBoxLi.id = 'error-container';
  errBoxLi.className = 'hidden';
  const notesContainer = document.getElementById('left-tab');
  notesContainer.innerHTML = '';
  notesContainer.appendChild(createNoteLi);
  notesContainer.appendChild(errBoxLi);
  fetchNotes();
});