document.addEventListener('DOMContentLoaded',()=>{
const firebaseConfig={apiKey:"AIzaSyBh7oN1SOlJvTdV4ld5JRP6wBRWu-DL_nQ",authDomain:"kawsar-messaging-apps.firebaseapp.com",databaseURL:"https://kawsar-messaging-apps-default-rtdb.firebaseio.com",projectId:"kawsar-messaging-apps",storageBucket:"kawsar-messaging-apps.firebasestorage.app",messagingSenderId:"738233086903",appId:"1:738233086903:web:9357e641d888c2f9a76e32",measurementId:"G-18N3ZJFVKW"};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth();
const db=firebase.database();
let currentUser=null;
let currentUserData=null;
let appInitialized=false;
let authStateInitialized=false;
let authStateResolve=null;
const authReadyPromise=new Promise(resolve=>{authStateResolve=resolve;});
let currentChatPartner=null;
let currentChatListener=null;
let unreadListeners={};
let contactListeners={};
let requestListener=null;
let callListener=null;
let lastMessageTimestamps={};
let messageElements={};
let calcDisplayValue='0';
let peerConnection=null;
let localStream=null;
let remoteStream=null;
let incomingCallData=null;
let activeCallId=null;
let customPromptResolver = null;
const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
const appContainer=document.getElementById('app-container');
const calculatorView=document.getElementById('calculator-view');
const authView=document.getElementById('auth-view');
const mainView=document.getElementById('main-view');
const chatView=document.getElementById('chat-view');
const videoCallView=document.getElementById('video-call-view');
const voiceCallView=document.getElementById('voice-call-view');
const allViews=document.querySelectorAll('.view');
const addFriendModal=document.getElementById('add-friend-modal');
const profileViewModal=document.getElementById('profile-view-modal');
const incomingCallModal=document.getElementById('incoming-call-modal');
const customPromptModal=document.getElementById('custom-prompt-modal');
const customPromptForm=document.getElementById('custom-prompt-form');
const promptInput=document.getElementById('prompt-input');
const allModals=document.querySelectorAll('.modal');
const calcDisplay=document.getElementById('calc-display');
const calcButtons=document.getElementById('calc-buttons');
const calcNotificationBadge=document.getElementById('calc-notification-badge');
const loginForm=document.getElementById('login-form');
const signupForm=document.getElementById('signup-form');
const loginError=document.getElementById('login-error');
const signupError=document.getElementById('signup-error');
const showSignupBtn=document.getElementById('show-signup');
const showLoginBtn=document.getElementById('show-login');
const addFriendBtn=document.getElementById('add-friend-btn');
const menuBtn=document.getElementById('menu-btn');
const navHome=document.getElementById('nav-home');
const navNotifications=document.getElementById('nav-notifications');
const navCalls=document.getElementById('nav-calls');
const homeContent=document.getElementById('home-content');
const notificationsContent=document.getElementById('notifications-content');
const callsContent=document.getElementById('calls-content');
const allNavTabs=document.querySelectorAll('.nav-tab');
const allContentPanels=document.querySelectorAll('.content-panel');
const chatsBadge=document.getElementById('chats-badge');
const notificationsBadge=document.getElementById('notifications-badge');
const chatBackBtn=document.getElementById('chat-back-btn');
const chatHeaderInfo=document.getElementById('chat-header-info');
const chatHeaderPicWrapper=document.getElementById('chat-header-pic-wrapper');
const chatHeaderName=document.getElementById('chat-header-name');
const chatMoreBtn=document.getElementById('chat-more-btn');
const chatMessages=document.getElementById('chat-messages');
const chatInput=document.getElementById('chat-input');
const chatSendBtn=document.getElementById('chat-send-btn');
const remoteVideo=document.getElementById('remote-video');
const localVideo=document.getElementById('local-video');
const remoteAudio=document.getElementById('remote-audio');
const ringtone=document.getElementById('ringtone');
const videoCallerPicWrapper=document.getElementById('video-caller-pic-wrapper');
const videoCallerName=document.getElementById('video-caller-name');
const videoEndCallBtn=document.getElementById('video-end-call-btn');
const voiceCallerPicWrapper=document.getElementById('voice-caller-pic-wrapper');
const voiceCallerName=document.getElementById('voice-caller-name');
const voiceCallStatus=document.getElementById('voice-call-status');
const voiceEndCallBtn=document.getElementById('voice-end-call-btn');
const addFriendForm=document.getElementById('add-friend-form');
const friendIdInput=document.getElementById('friend-id-input');
const profilePicWrapper=document.getElementById('profile-pic-wrapper');
const profileViewName=document.getElementById('profile-view-name');
const profileViewEmail=document.getElementById('profile-view-email');
const profileEditNameBtn=document.getElementById('profile-edit-name-btn');
const profileEditNameForm=document.getElementById('profile-edit-name-form');
const profileNameInput=document.getElementById('profile-name-input');
const profileSaveNameBtn=document.getElementById('profile-save-name-btn');
const profileUserIdText=document.getElementById('profile-user-id-text');
const profileUserEmailText=document.getElementById('profile-user-email-text');
const profileCopyIdBtn=document.getElementById('profile-copy-id-btn');
const profileCopyEmailBtn=document.getElementById('profile-copy-email-btn');
const blockedUsersList=document.getElementById('blocked-users-list');
const logoutBtn=document.getElementById('logout-btn');
const incomingCallPicWrapper=document.getElementById('incoming-call-pic-wrapper');
const incomingCallName=document.getElementById('incoming-call-name');
const incomingCallType=document.getElementById('incoming-call-type');
const acceptCallBtn=document.getElementById('accept-call-btn');
const rejectCallBtn=document.getElementById('reject-call-btn');
const notificationContainer = document.getElementById('notification-container');

// --- Custom Notification Functions ---

function showNotification(message, duration = 3000, actions = null) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    notification.appendChild(textSpan);

    let notificationTimeout;

    if (actions) {
        const actionWrapper = document.createElement('div');
        actionWrapper.className = 'notification-action-buttons';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.text;
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent accidental removal if click leads to other element
                action.callback();
                hideNotification(notification, notificationTimeout);
            });
            actionWrapper.appendChild(btn);
        });
        notification.appendChild(actionWrapper);
        // Do not auto-hide confirmation style messages unless explicitly told to
        if (!duration) duration = 30000; // Keep action notifications up longer
    }

    notificationContainer.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-hide after duration (if set)
    if (duration > 0) {
        notificationTimeout = setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return {
        hide: () => hideNotification(notification, notificationTimeout),
        element: notification,
        timeout: notificationTimeout
    };
}

function hideNotification(notification, timeout) {
    clearTimeout(timeout);
    notification.classList.remove('show');
    notification.addEventListener('transitionend', () => {
        notification.remove();
    }, { once: true });
}

function customConfirm(message) {
    return new Promise(resolve => {
        const actions = [
            { text: 'YES', callback: () => resolve(true) },
            { text: 'NO', callback: () => resolve(false) }
        ];
        // Use a very long duration, rely on action click to dismiss
        showNotification(message, 10000, actions); 
    });
}

function customPrompt(title, defaultValue = '') {
    return new Promise(resolve => {
        customPromptResolver = resolve;
        document.getElementById('prompt-modal-title').textContent = title;
        promptInput.value = defaultValue;
        showModal('custom-prompt-modal');
        history.pushState(null, '', window.location.pathname);
    });
}

customPromptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (customPromptResolver) {
        customPromptResolver(promptInput.value);
        customPromptResolver = null;
    }
    showModal('custom-prompt-modal', false);
    if (history.state) history.back();
});

customPromptModal.querySelector('.close-modal-btn').addEventListener('click', () => {
    if (customPromptResolver) {
        customPromptResolver(null);
        customPromptResolver = null;
    }
    showModal('custom-prompt-modal', false);
    if (history.state) history.back();
});

// --- End Custom Notification Functions ---

function showView(viewId){
allViews.forEach(view=>{
view.classList.toggle('hidden',view.id!==viewId);
});
}
function showModal(modalId,show=true){
const modal=document.getElementById(modalId);
if(modal){
modal.classList.toggle('hidden',!show);
}
}
function showPanel(panelId){
allContentPanels.forEach(panel=>{
panel.classList.toggle('active',panel.id===panelId);
});
allNavTabs.forEach(tab=>{
tab.classList.toggle('active',tab.id===`nav-${panelId.split('-')[0]}`);
});
}
function getChatId(uid1,uid2){
return uid1<uid2?`${uid1}_${uid2}`:`${uid2}_${uid1}`;
}
function formatTimestamp(timestamp){
const date=new Date(timestamp);
let hours=date.getHours();
const minutes=date.getMinutes();
const ampm=hours>=12?'PM':'AM';
hours=hours%12;
hours=hours?hours:12;
const minutesStr=minutes<10?'0'+minutes:minutes;
return`${hours}:${minutesStr} ${ampm}`;
}
function getProfilePicHTML(user,placeholderSize='2.5rem'){
if(user.profilePicUrl){
return`<img src="${user.profilePicUrl}" alt="Pic">`;
}else{
const name=user.name||user.uid;
const placeholder=name?name.charAt(0).toUpperCase():'?';
return`<span style="font-size: ${placeholderSize}; line-height: 1; user-select: none;">${placeholder}</span>`;
}
}
function cleanupListeners(){
if(currentChatListener)currentChatListener.off();
if(requestListener)requestListener.off();
if(callListener)callListener.off();
Object.values(unreadListeners).forEach(listener=>{
if(listener&&typeof listener.off==='function'){
listener.off();
}
});
Object.values(contactListeners).forEach(listener=>{
if(listener&&typeof listener.off==='function'){
listener.off();
}
});
unreadListeners={};
contactListeners={};
currentChatListener=null;
requestListener=null;
callListener=null;
lastMessageTimestamps={};
messageElements={};
}
function cleanupCall(){
if(peerConnection){
peerConnection.close();
peerConnection=null;
}
if(localStream){
localStream.getTracks().forEach(track=>track.stop());
localStream=null;
}
remoteVideo.srcObject=null;
localVideo.srcObject=null;
remoteAudio.srcObject=null;
ringtone.pause();
showModal('incoming-call-modal',false);
if(currentUser){
showView('main-view');
}
incomingCallData=null;
activeCallId=null;
}
function copyText(text,message){
if(!text)return;
try{
const el=document.createElement('textarea');
el.value=text;
el.setAttribute('readonly','');
el.style.position='absolute';
el.style.left='-9999px';
document.body.appendChild(el);
const selected=document.getSelection().rangeCount>0
?document.getSelection().getRangeAt(0)
:false;
el.select();
document.execCommand('copy');
document.body.removeChild(el);
if(selected){
document.getSelection().removeAllRanges();
document.getSelection().addRange(selected);
}
showNotification(message); // Replaced alert
}catch(err){
console.error('Failed to copy text: ',err);
showNotification('Failed to copy. See console for details.', 5000); // Replaced alert
}
}
function handleCustomBack(){
if(!profileViewModal.classList.contains('hidden')){
showModal('profile-view-modal',false);
return true;
}
if(!addFriendModal.classList.contains('hidden')){
showModal('add-friend-modal',false);
return true;
}
if(!incomingCallModal.classList.contains('hidden')){
rejectCallBtn.click();
return true;
}
if(!chatView.classList.contains('hidden')){
chatBackBtn.click();
return true;
}
if(!videoCallView.classList.contains('hidden')){
videoEndCallBtn.click();
return true;
}
if(!voiceCallView.classList.contains('hidden')){
voiceEndCallBtn.click();
return true;
}
if(!authView.classList.contains('hidden')){
showView('calculator-view');
return true;
}
if(!mainView.classList.contains('hidden')){
if(!homeContent.classList.contains('active')){
showPanel('home-content');
return true;
}else{
showView('calculator-view');
return true;
}
}
if(!calculatorView.classList.contains('hidden')){
return false;
}
return false;
}
window.addEventListener('popstate',(event)=>{
const handled=handleCustomBack();
if(handled){
history.pushState(null,'',window.location.pathname);
}
});
history.pushState(null,'',window.location.pathname);
function updateCalcDisplay(){
if(calcDisplayValue.length>9){
calcDisplay.style.fontSize='2.5rem';
}else if(calcDisplayValue.length>6){
calcDisplay.style.fontSize='3.5rem';
}else{
calcDisplay.style.fontSize='4.5rem';
}
calcDisplay.textContent=calcDisplayValue;
}
calcButtons.addEventListener('click',(e)=>{
const button=e.target.closest('.calc-btn');
if(!button)return;
const key=button.dataset.key;
const lastChar=calcDisplayValue[calcDisplayValue.length-1];
const operators=['/','*','-','+'];
if(key==='clear'){
calcDisplayValue='0';
}else if(key==='backspace'){
if(calcDisplayValue.length>1){
calcDisplayValue=calcDisplayValue.slice(0,-1);
}else{
calcDisplayValue='0';
}
}else if(key==='.'){
if(lastChar!=='.'){
calcDisplayValue+=key;
}
}else if(key==='equals'){
if(calcDisplayValue==='59+59'){
calcDisplayValue='0';
updateCalcDisplay();
authReadyPromise.then(()=>{
if(currentUser){
if(currentUserData){
if(appInitialized){
showView('main-view');
history.pushState(null,'',window.location.pathname);
}else{
initializeApp();
}
}else{
showView('auth-view');
history.pushState(null,'',window.location.pathname);
}
}else{
showView('auth-view');
history.pushState(null,'',window.location.pathname);
}
});
}else{
try{
let expression=calcDisplayValue
.replace(/×/g,'*')
.replace(/÷/g,'/')
.replace(/−/g,'-');
if(operators.includes(expression[expression.length-1])){
expression=expression.slice(0,-1);
}
const result=new Function('return '+expression)();
calcDisplayValue=String(Number(result.toFixed(4)));
}catch(err){
calcDisplayValue='Error';
}
}
}else if(operators.includes(key)){
if(operators.includes(lastChar)){
calcDisplayValue=calcDisplayValue.slice(0,-1)+key;
}else{
calcDisplayValue+=key;
}
}else{
if(calcDisplayValue==='0'||calcDisplayValue==='Error'){
calcDisplayValue=key;
}else{
calcDisplayValue+=key;
}
}
updateCalcDisplay();
});
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(()=>{
initializeAuthListener();
})
.catch((error)=>{
console.error("Error setting auth persistence: ",error);
initializeAuthListener();
});
function initializeAuthListener(){
auth.onAuthStateChanged(user=>{
cleanupListeners();
if(user){
currentUser=user;
db.ref('users/'+user.uid).once('value',snapshot=>{
if(snapshot.exists()){
currentUserData=snapshot.val();
listenForUnreadCounts();
}else{
currentUserData=null;
}
if(!authStateInitialized){
authStateInitialized=true;
authStateResolve();
}
});
}else{
currentUser=null;
currentUserData=null;
appInitialized=false;
cleanupCall();
if(authStateInitialized){
showView('calculator-view');
}
if(calcNotificationBadge){
calcNotificationBadge.classList.add('hidden');
calcNotificationBadge.textContent='0';
}
if(!authStateInitialized){
authStateInitialized=true;
authStateResolve();
}
}
});
}
loginForm.addEventListener('submit',(e)=>{
e.preventDefault();
loginError.textContent='';
const email=loginForm['login-email'].value;
const password=loginForm['login-password'].value;
auth.signInWithEmailAndPassword(email,password)
.then((userCredential)=>{
const user=userCredential.user;
db.ref('users/'+user.uid).once('value',snapshot=>{
if(snapshot.exists()){
currentUserData=snapshot.val();
initializeApp();
}else{
loginError.textContent="Profile data not found. Please contact support.";
}
});
})
.catch(error=>{
loginError.textContent=error.message;
});
});
signupForm.addEventListener('submit',(e)=>{
e.preventDefault();
signupError.textContent='';
const email=signupForm['signup-email'].value;
const password=signupForm['signup-password'].value;
auth.createUserWithEmailAndPassword(email,password)
.then((userCredential)=>{
const user=userCredential.user;
const defaultProfile={
uid:user.uid,
email:user.email,
name:user.uid,
profilePicUrl:"",
blocked:{}
};
db.ref('users/'+user.uid).set(defaultProfile)
.then(()=>{
loginForm.classList.remove('hidden');
signupForm.classList.add('hidden');
showNotification('Signup successful! Please log in.'); // Replaced alert
})
.catch(error=>{
signupError.textContent="Signup OK, but failed to create profile: "+error.message;
});
})
.catch(error=>{
signupError.textContent=error.message;
});
});
logoutBtn.addEventListener('click',()=>{
appInitialized=false;
auth.signOut();
showModal('profile-view-modal',false);
});
showSignupBtn.addEventListener('click',()=>{
loginForm.classList.add('hidden');
signupForm.classList.remove('hidden');
});
showLoginBtn.addEventListener('click',()=>{
loginForm.classList.remove('hidden');
signupForm.classList.add('hidden');
});
menuBtn.addEventListener('click',()=>{
if(!currentUserData)return;
profilePicWrapper.innerHTML=getProfilePicHTML(currentUserData,'4.5rem');
profileViewName.textContent=currentUserData.name;
profileViewEmail.textContent=currentUserData.email;
profileUserIdText.textContent=currentUserData.uid;
profileUserEmailText.textContent=currentUserData.email;
blockedUsersList.innerHTML='';
if(currentUserData.blocked&&Object.keys(currentUserData.blocked).length>0){
Object.keys(currentUserData.blocked).forEach(uid=>{
db.ref('users/'+uid).once('value',snapshot=>{
if(snapshot.exists()){
const user=snapshot.val();
const item=document.createElement('div');
item.className='blocked-user-item';
item.innerHTML=`
<span>${getProfilePicHTML({name:user.name,profilePicUrl:user.profilePicUrl},'1.5rem')} ${user.name}</span>
<button class="unblock-btn" data-uid="${user.uid}">Unblock</button>
`;
blockedUsersList.appendChild(item);
}
});
});
}else{
blockedUsersList.innerHTML='<p style="padding: 8px; text-align: center;">No blocked users.</p>';
}
profileEditNameForm.classList.add('hidden');
profileViewName.classList.remove('hidden');
profileEditNameBtn.classList.remove('hidden');
showModal('profile-view-modal');
history.pushState(null,'',window.location.pathname);
});
profilePicWrapper.addEventListener('click',async()=>{
const newUrl=await customPrompt('Enter new profile picture URL:',currentUserData.profilePicUrl||''); // Replaced prompt
if(newUrl!==null){
if(newUrl===''||(newUrl.startsWith('http://')||newUrl.startsWith('https://'))){
db.ref(`users/${currentUser.uid}/profilePicUrl`).set(newUrl)
.then(()=>{
currentUserData.profilePicUrl=newUrl;
profilePicWrapper.innerHTML=getProfilePicHTML(currentUserData,'4.5rem');
showNotification('Profile picture updated!'); // Replaced alert
})
.catch(err=>showNotification('Error: '+err.message)); // Replaced alert
}else{
showNotification('Invalid URL. Must start with http:// or https://, or be empty.', 5000); // Replaced alert
}
}
});
profileEditNameBtn.addEventListener('click',()=>{
profileEditNameForm.classList.remove('hidden');
profileNameInput.value=currentUserData.name;
profileViewName.classList.add('hidden');
profileEditNameBtn.classList.add('hidden');
});
profileSaveNameBtn.addEventListener('click',()=>{
const newName=profileNameInput.value.trim();
if(newName&&newName!==currentUserData.name){
db.ref(`users/${currentUser.uid}/name`).set(newName)
.then(()=>{
currentUserData.name=newName;
profileViewName.textContent=newName;
showNotification('Name updated!'); // Replaced alert
if(!currentUserData.profilePicUrl){
profilePicWrapper.innerHTML=getProfilePicHTML(currentUserData,'4.5rem');
}
})
.catch(err=>showNotification('Error: '+err.message)) // Replaced alert
.finally(()=>{
profileEditNameForm.classList.add('hidden');
profileViewName.classList.remove('hidden');
profileEditNameBtn.classList.remove('hidden');
});
}else{
profileEditNameForm.classList.add('hidden');
profileViewName.classList.remove('hidden');
profileEditNameBtn.classList.remove('hidden');
}
});
profileCopyIdBtn.addEventListener('click',()=>{
copyText(currentUserData.uid,'User ID copied to clipboard!');
});
profileCopyEmailBtn.addEventListener('click',()=>{
copyText(currentUserData.email,'Email copied to clipboard!');
});
blockedUsersList.addEventListener('click',(e)=>{
if(e.target.classList.contains('unblock-btn')){
const uidToUnblock=e.target.dataset.uid;
unblockUser(uidToUnblock);
}
});
document.querySelectorAll('.close-modal-btn').forEach(btn=>{
btn.addEventListener('click',(e)=>{
const modal=e.target.closest('.modal');
if(modal){
showModal(modal.id,false);
if(history.state){
history.back();
}
}
});
});
function initializeApp(){
showView('main-view');
showPanel('home-content');
history.pushState(null,'',window.location.pathname);
listenForContacts();
listenForFriendRequests();
listenForIncomingCalls();
listenForAllFriends();
appInitialized=true;
}
addFriendBtn.addEventListener('click',()=>{
addFriendForm.reset();
showModal('add-friend-modal');
history.pushState(null,'',window.location.pathname);
});
addFriendForm.addEventListener('submit',(e)=>{
e.preventDefault();
const friendId=friendIdInput.value.trim();
const initialMessage=document.getElementById('friend-message-input').value.trim();
if(friendId===currentUser.uid){
showNotification("You can't add yourself as a friend.", 5000); // Replaced alert
return;
}
if(currentUserData.blocked&&currentUserData.blocked[friendId]){
showNotification("You have blocked this user. Unblock them to send a request.", 5000); // Replaced alert
return;
}
db.ref('users/'+friendId).once('value',snapshot=>{
if(snapshot.exists()){
const recipient=snapshot.val();
if(recipient.blocked&&recipient.blocked[currentUser.uid]){
showNotification("This user is not accepting friend requests.", 5000); // Replaced alert
return;
}
const requestRef=db.ref(`requests/${friendId}/${currentUser.uid}`);
const requestData={
fromUid:currentUser.uid,
fromName:currentUserData.name,
fromProfilePicUrl:currentUserData.profilePicUrl||"",
timestamp:firebase.database.ServerValue.TIMESTAMP
};
if(initialMessage){
requestData.initialMessage=initialMessage;
}
requestRef.set(requestData).then(()=>{
showNotification('Friend request sent!'); // Replaced alert
showModal('add-friend-modal',false);
if(history.state)history.back();
});
}else{
showNotification('User not found.', 5000); // Replaced alert
}
});
});
function listenForFriendRequests(){
if(requestListener)requestListener.off();
requestListener=db.ref('requests/'+currentUser.uid);
requestListener.on('value',snapshot=>{
notificationsContent.innerHTML='';
let requestCount=0;
if(snapshot.exists()){
snapshot.forEach(childSnapshot=>{
const request=childSnapshot.val();
if(currentUserData.blocked&&currentUserData.blocked[request.fromUid]){
return;
}
requestCount++;
const item=document.createElement('div');
item.className='list-item';
const subtext=request.initialMessage
?`<div class="item-subtext" style="font-style: italic; color: var(--wa-text-primary); white-space: normal;">"${request.initialMessage}"</div>`
:'<div class="item-subtext">Wants to be your contact.</div>';
item.innerHTML=`
<div class="item-emoji">
${getProfilePicHTML({name:request.fromName,profilePicUrl:request.fromProfilePicUrl})}
</div>
<div class="item-details">
<div class="item-name">${request.fromName}</div>
${subtext} <div class="notification-actions">
<button class="notif-btn reject" data-uid="${request.fromUid}">Reject</button>
<button class="notif-btn accept" data-uid="${request.fromUid}">Accept</button>
</div>
</div>
`;
notificationsContent.appendChild(item);
});
}
if(requestCount===0){
notificationsContent.innerHTML='<p style="padding: 20px; text-align: center; color: var(--wa-text-secondary);">No new updates.</p>';
}
notificationsBadge.textContent=requestCount;
notificationsBadge.classList.toggle('hidden',requestCount===0);
});
}
notificationsContent.addEventListener('click',(e)=>{
const uid=e.target.dataset.uid;
if(!uid)return;
if(e.target.classList.contains('accept')){
db.ref(`requests/${currentUser.uid}/${uid}`).once('value',snapshot=>{
if(snapshot.exists()){
const requestData=snapshot.val();
acceptRequest(uid,requestData);
}else{
console.log("Could not find request data to accept.");
rejectRequest(uid);
}
});
}else if(e.target.classList.contains('reject')){
rejectRequest(uid);
}
});
function acceptRequest(senderId,requestData){
const myUid=currentUser.uid;
const updates={};
updates[`contacts/${myUid}/${senderId}`]=true;
updates[`contacts/${senderId}/${myUid}`]=true;
updates[`requests/${myUid}/${senderId}`]=null;
if(requestData&&requestData.initialMessage){
const chatId=getChatId(myUid,senderId);
const message={
text:requestData.initialMessage,
senderId:senderId,
receiverId:myUid,
timestamp:requestData.timestamp,
status:'sent'
};
const newMessageKey=db.ref('messages/'+chatId).push().key;
updates[`messages/${chatId}/${newMessageKey}`]=message;
updates[`unreadCounts/${myUid}/${senderId}`]=1;
}
db.ref().update(updates)
.then(()=>{
console.log('Friend request accepted and message imported.');
})
.catch(err=>console.error('Error accepting request:',err));
}
function rejectRequest(senderId){
db.ref(`requests/${currentUser.uid}/${senderId}`).remove()
.then(()=>console.log('Friend request rejected.'))
.catch(err=>console.error('Error rejecting request:',err));
}
function sortChatList(){
const chatItems=Array.from(homeContent.querySelectorAll('.list-item'));
chatItems.sort((a,b)=>{
const uidA=a.dataset.uid;
const uidB=b.dataset.uid;
const timeA=lastMessageTimestamps[uidA]||0;
const timeB=lastMessageTimestamps[uidB]||0;
return timeB-timeA;
});
chatItems.forEach(item=>homeContent.appendChild(item));
const noChatsMsgId='no-chats-message';
let noChatsMsg=homeContent.querySelector(`#${noChatsMsgId}`);
const allHiddenOrEmpty=chatItems.length===0||chatItems.every(item=>item.classList.contains('hidden'));
if(allHiddenOrEmpty&&!noChatsMsg){
noChatsMsg=document.createElement('p');
noChatsMsg.id=noChatsMsgId;
noChatsMsg.style.padding='20px';
noChatsMsg.style.textAlign='center';
noChatsMsg.style.color='var(--wa-text-secondary)';
noChatsMsg.textContent='No active chats. Start a new one from the "ALL FRIEND" tab.';
homeContent.appendChild(noChatsMsg);
}else if(!allHiddenOrEmpty&&noChatsMsg){
noChatsMsg.remove();
}
}
function listenForContacts(){
if(contactListeners.main)contactListeners.main.off();
contactListeners.main=db.ref('contacts/'+currentUser.uid);
Object.keys(contactListeners).filter(key=>key!=='main'&&key!=='allFriends').forEach(key=>{
if(contactListeners[key]&&typeof contactListeners[key].off==='function'){
contactListeners[key].off();
}
});
homeContent.innerHTML='<p style="padding: 20px; text-align: center; color: var(--wa-text-secondary);">Loading contacts...</p>';
lastMessageTimestamps={};
contactListeners.main.on('value',snapshot=>{
const currentUids=new Set(Array.from(homeContent.querySelectorAll('.list-item')).map(el=>el.dataset.uid));
const newUids=new Set();
let contactPromises=[];
if(snapshot.exists()){
snapshot.forEach(childSnapshot=>{
const contactId=childSnapshot.key;
newUids.add(contactId);
if(currentUserData.blocked&&currentUserData.blocked[contactId]){
const existingItem=homeContent.querySelector(`.list-item[data-uid="${contactId}"]`);
if(existingItem)existingItem.remove();
return;
}
let existingItem=homeContent.querySelector(`.list-item[data-uid="${contactId}"]`);
if(!existingItem){
contactPromises.push(db.ref('users/'+contactId).once('value').then(userSnapshot=>{
if(userSnapshot.exists()){
const contact=userSnapshot.val();
if(contact.blocked&&contact.blocked[currentUser.uid])return null;
const item=document.createElement('div');
item.className='list-item hidden';
item.dataset.uid=contact.uid;
item.innerHTML=`
<div class="item-emoji">${getProfilePicHTML(contact)}</div>
<div class="item-details">
<div class="item-name">${contact.name}</div>
<div class="item-subtext" id="subtext-${contact.uid}">Tap to chat</div>
</div>
<div class="item-actions">
<span class="badge hidden" id="badge-${contact.uid}"></span>
</div>
<div class="delete-overlay">
<button class="delete-button" data-uid="${contact.uid}">Delete Chat</button>
<button class="cancel-delete-button" data-uid="${contact.uid}">Cancel</button>
</div>
`;
item.addEventListener('click',(e)=>{
if(!item.classList.contains('deleting')&&!e.target.closest('.delete-button')&&!e.target.closest('.cancel-delete-button')){
openChat(contact);
}
});
let timer;
item.addEventListener('mousedown',(e)=>{
if(e.button!==0||e.target.closest('.delete-overlay'))return;
timer=setTimeout(()=>{
document.querySelectorAll('.list-item.deleting').forEach(li=>{
if(li!==item)li.classList.remove('deleting');
});
item.classList.add('deleting');
},500);
});
item.addEventListener('touchstart',(e)=>{
if(e.target.closest('.delete-overlay'))return;
timer=setTimeout(()=>{
document.querySelectorAll('.list-item.deleting').forEach(li=>{
if(li!==item)li.classList.remove('deleting');
});
item.classList.add('deleting');
},500);
});
item.addEventListener('mouseup',()=>clearTimeout(timer));
item.addEventListener('mouseleave',()=>clearTimeout(timer));
item.addEventListener('touchend',()=>clearTimeout(timer));
item.addEventListener('touchcancel',()=>clearTimeout(timer));
item.querySelector('.delete-button').addEventListener('click',async(e)=>{ // Added async
e.stopPropagation();
const isConfirmed = await customConfirm('Are you sure you want to delete this chat history?'); // Replaced confirm
if(isConfirmed) {
deleteChatHistory(contact.uid);
} else {
item.classList.remove('deleting'); // Cancel delete if not confirmed
}
});
item.querySelector('.cancel-delete-button').addEventListener('click',(e)=>{
e.stopPropagation();
item.classList.remove('deleting');
});
listenForLastMessage(contact.uid);
return item;
}
return null;
}));
}else{
listenForLastMessage(contactId);
db.ref('users/'+contactId).once('value').then(userSnapshot=>{
if(userSnapshot.exists()){
const contact=userSnapshot.val();
const itemEmoji=existingItem.querySelector('.item-emoji');
const itemName=existingItem.querySelector('.item-name');
if(itemEmoji)itemEmoji.innerHTML=getProfilePicHTML(contact);
if(itemName)itemName.textContent=contact.name;
}
});
}
});
}
currentUids.forEach(uid=>{
if(!newUids.has(uid)){
homeContent.querySelector(`.list-item[data-uid="${uid}"]`).remove();
if(contactListeners[uid]){
contactListeners[uid].off();
delete contactListeners[uid];
}
delete lastMessageTimestamps[uid];
}
});
Promise.all(contactPromises).then(items=>{
if(homeContent.innerHTML.includes('Loading contacts'))homeContent.innerHTML='';
const validItems=items.filter(item=>item!==null);
if(validItems.length===0){
sortChatList();
return;
}
let checkedCount=0;
validItems.forEach(item=>{
homeContent.appendChild(item);
const contactId=item.dataset.uid;
const chatId=getChatId(currentUser.uid,contactId);
db.ref('messages/'+chatId).limitToLast(1).once('value',snapshot=>{
if(snapshot.exists()){
let latestMsg=null;
snapshot.forEach(child=>{latestMsg=child.val();});
if(latestMsg){
lastMessageTimestamps[contactId]=latestMsg.timestamp;
const subtextEl=document.getElementById(`subtext-${contactId}`);
if(subtextEl){
const sender=latestMsg.senderId===currentUser.uid?'You: ':'';
subtextEl.textContent=`${sender}${latestMsg.text}`;
}
item.classList.remove('hidden');
}
}else{
lastMessageTimestamps[contactId]=0;
}
checkedCount++;
if(checkedCount===validItems.length){
sortChatList();
}
});
});
});
});
}
function listenForAllFriends(){
const allFriendsList=document.getElementById('calls-content');
if(contactListeners.allFriends)contactListeners.allFriends.off();
const contactsRef=db.ref('contacts/'+currentUser.uid);
contactListeners.allFriends=contactsRef;
contactsRef.on('value',snapshot=>{
allFriendsList.innerHTML='';
let friendCount=0;
if(snapshot.exists()){
snapshot.forEach(childSnapshot=>{
const contactId=childSnapshot.key;
if(currentUserData.blocked&&currentUserData.blocked[contactId]){
return;
}
friendCount++;
db.ref('users/'+contactId).once('value',userSnapshot=>{
if(userSnapshot.exists()){
const contact=userSnapshot.val();
if(contact.blocked&&contact.blocked[currentUser.uid])return;
const item=document.createElement('div');
item.className='list-item';
item.dataset.uid=contact.uid;
item.innerHTML=`
<div class="item-emoji">${getProfilePicHTML(contact)}</div>
<div class="item-details">
<div class="item-name">${contact.name}</div>
</div>
`;
item.addEventListener('click',()=>{
openChat(contact);
});
allFriendsList.appendChild(item);
}
});
});
}
if(friendCount===0){
allFriendsList.innerHTML='<p style="padding: 20px; text-align: center; color: var(--wa-text-secondary);">No friends found. Add friends using the button above.</p>';
}
});
}
function deleteChatHistory(partnerId){
const myUid=currentUser.uid;
const updates={};
const chatId=getChatId(myUid,partnerId);
updates[`messages/${chatId}`]=null;
updates[`unreadCounts/${myUid}/${partnerId}`]=null;
updates[`unreadCounts/${partnerId}/${myUid}`]=null;
db.ref().update(updates)
.then(()=>{
console.log('Chat history deleted.');
showNotification('Chat history deleted.'); // Replaced alert
})
.catch(err=>{
showNotification(`Error deleting chat: ${err.message}`, 5000); // Replaced alert
console.error('Error deleting chat history:',err);
});
}
function listenForLastMessage(contactId){
const chatId=getChatId(currentUser.uid,contactId);
const subtextEl=document.getElementById(`subtext-${contactId}`);
if(contactListeners[contactId]){
contactListeners[contactId].off();
}
const messagesRef=db.ref('messages/'+chatId).limitToLast(1);
contactListeners[contactId]=messagesRef;
messagesRef.on('child_added',snapshot=>{
const msg=snapshot.val();
const item=homeContent.querySelector(`.list-item[data-uid="${contactId}"]`);
if(item){
if(subtextEl){
const sender=msg.senderId===currentUser.uid?'You: ':'';
subtextEl.textContent=`${sender}${msg.text}`;
}
lastMessageTimestamps[contactId]=msg.timestamp;
item.classList.remove('hidden');
sortChatList();
}
});
messagesRef.on('child_removed',()=>{
db.ref('messages/'+chatId).once('value',snapshot=>{
const item=homeContent.querySelector(`.list-item[data-uid="${contactId}"]`);
if(!snapshot.exists()){
if(subtextEl){
subtextEl.textContent='Tap to chat';
}
lastMessageTimestamps[contactId]=0;
if(item)item.classList.add('hidden');
sortChatList();
}
});
});
}
allNavTabs.forEach(tab=>{
tab.addEventListener('click',()=>{
const panelId=`${tab.id.split('-')[1]}-content`;
showPanel(panelId);
history.pushState(null,'',window.location.pathname);
});
});
function openChat(partner){
currentChatPartner=partner;
chatHeaderPicWrapper.innerHTML=getProfilePicHTML(partner,'1.8rem');
chatHeaderName.textContent=partner.name;
chatMessages.innerHTML='';
messageElements={};
showView('chat-view');
history.pushState(null,'',window.location.pathname);
db.ref(`unreadCounts/${currentUser.uid}/${partner.uid}`).remove();
const chatId=getChatId(currentUser.uid,partner.uid);
if(currentChatListener){
currentChatListener.off();
}
const messagesRef=db.ref('messages/'+chatId);
currentChatListener=messagesRef.limitToLast(50);
currentChatListener.on('child_added',snapshot=>{
const msg=snapshot.val();
renderMessage(snapshot.key,msg);
if(msg.receiverId===currentUser.uid&&msg.status!=='seen'){
messagesRef.child(snapshot.key).update({status:'seen'});
}
});
messagesRef.on('child_changed',snapshot=>{
const msg=snapshot.val();
if(msg.senderId===currentUser.uid&&msg.receiverId===partner.uid&&messageElements[snapshot.key]){
updateMessageStatus(snapshot.key,msg.status);
}
});
}
function getStatusSVG(status){
const baseClass='message-status-icon';
const isSeen=status==='seen';
const fill=isSeen?'var(--wa-accent-blue)':'var(--wa-text-secondary)';
const svgPath=isSeen
?'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'
:'M9.01 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9.01 16.2zm7-9.9l1.4 1.4L9 16.2l-1.4-1.4L9 13.4l7-7z';
return`
<svg class="${baseClass} ${isSeen?'seen':''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}">
<path d="${svgPath}"/>
</svg>
`;
}
function renderMessage(msgId,msg){
const isSent=msg.senderId===currentUser.uid;
if(messageElements[msgId])return;
const bubble=document.createElement('div');
bubble.className=`message-bubble ${isSent?'message-sent':'message-received'}`;
bubble.id=`msg-${msgId}`;
const contentWrapper=document.createElement('div');
contentWrapper.className='message-content-wrapper';
const textSpan=document.createElement('span');
textSpan.className='message-text';
textSpan.textContent=msg.text;
const timeStatusWrapper=document.createElement('div');
timeStatusWrapper.className='message-time-status';
const timeSpan=document.createElement('span');
timeSpan.textContent=formatTimestamp(msg.timestamp);
timeStatusWrapper.appendChild(timeSpan);
if(isSent){
const statusIconWrapper=document.createElement('span');
statusIconWrapper.id=`status-${msgId}`;
statusIconWrapper.innerHTML=getStatusSVG(msg.status||'sent');
timeStatusWrapper.appendChild(statusIconWrapper);
}
contentWrapper.appendChild(textSpan);
contentWrapper.appendChild(timeStatusWrapper);
bubble.appendChild(contentWrapper);
chatMessages.appendChild(bubble);
messageElements[msgId]=bubble;
if(chatMessages.scrollHeight-chatMessages.clientHeight<=chatMessages.scrollTop+100){
chatMessages.scrollTop=chatMessages.scrollHeight;
}
}
function updateMessageStatus(msgId,newStatus){
const statusEl=document.getElementById(`status-${msgId}`);
if(statusEl){
statusEl.innerHTML=getStatusSVG(newStatus);
}
}
chatSendBtn.addEventListener('click',sendMessage);
chatInput.addEventListener('keypress',(e)=>{
if(e.key==='Enter'){
sendMessage();
}
});
function sendMessage(){
const text=chatInput.value.trim();
if(text===''||!currentChatPartner)return;
const chatId=getChatId(currentUser.uid,currentChatPartner.uid);
const message={
text:text,
senderId:currentUser.uid,
receiverId:currentChatPartner.uid,
timestamp:firebase.database.ServerValue.TIMESTAMP,
status:'sent'
};
db.ref('messages/'+chatId).push(message);
const unreadRef=db.ref(`unreadCounts/${currentChatPartner.uid}/${currentUser.uid}`);
unreadRef.transaction(count=>(count||0)+1);
chatInput.value='';
chatInput.focus(); // এই লাইনটি যোগ করা হয়েছে
}
chatBackBtn.addEventListener('click',()=>{
showView('main-view');
currentChatPartner=null;
if(currentChatListener){
currentChatListener.off();
currentChatListener=null;
}
if(history.state){
}
});
function listenForUnreadCounts(){
const myUid=currentUser.uid;
if(unreadListeners.main)unreadListeners.main.off();
const unreadRoot=db.ref('unreadCounts/'+myUid);
unreadRoot.on('value',snapshot=>{
let totalUnread=0;
const counts=snapshot.val()||{};
document.querySelectorAll('.list-item').forEach(item=>{
const uid=item.dataset.uid;
if(uid){
const badge=document.getElementById(`badge-${uid}`);
const count=counts[uid]||0;
if(badge){
badge.textContent=count;
badge.classList.toggle('hidden',count===0);
}
}
});
totalUnread=Object.values(counts).reduce((sum,count)=>sum+count,0);
chatsBadge.textContent=totalUnread;
chatsBadge.classList.toggle('hidden',totalUnread===0);
if(calcNotificationBadge){
calcNotificationBadge.textContent=totalUnread;
calcNotificationBadge.classList.toggle('hidden',totalUnread===0);
}
});
unreadListeners.main=unreadRoot;
}
chatMoreBtn.addEventListener('click',async()=>{ // Added async
if(!currentChatPartner)return;
const isBlocked=currentUserData.blocked&&currentUserData.blocked[currentChatPartner.uid];
const actionText=isBlocked?`Unblock ${currentChatPartner.name}`:`Block ${currentChatPartner.name}`;
const isConfirmed = await customConfirm(actionText+"?"); // Replaced confirm
if(isConfirmed){
if(isBlocked){
unblockUser(currentChatPartner.uid);
}else{
blockUser(currentChatPartner.uid);
}
}
});
function blockUser(uid){
db.ref(`users/${currentUser.uid}/blocked/${uid}`).set(true)
.then(()=>{
showNotification('User blocked.'); // Replaced alert
currentUserData.blocked=currentUserData.blocked||{};
currentUserData.blocked[uid]=true;
listenForContacts();
listenForAllFriends();
showView('main-view');
if(history.state){
history.back();
}
});
}
function unblockUser(uid){
db.ref(`users/${currentUser.uid}/blocked/${uid}`).remove()
.then(()=>{
showNotification('User unblocked.'); // Replaced alert
if(currentUserData.blocked){
delete currentUserData.blocked[uid];
}
listenForContacts();
listenForAllFriends();
if(!profileViewModal.classList.contains('hidden')){
menuBtn.click();
}
});
}
async function startCall(isVideo){
if(!currentChatPartner)return;
const partnerId=currentChatPartner.uid;
try{
localStream=await navigator.mediaDevices.getUserMedia({
video:isVideo,
audio:true
});
localVideo.srcObject=localStream;
peerConnection=new RTCPeerConnection(rtcConfig);
addLocalTracksToPC();
const callRef=db.ref('calls').push();
activeCallId=callRef.key;
const offer=await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
const callData={
callId:activeCallId,
from:currentUser.uid,
to:partnerId,
offer:offer,
isVideo:isVideo,
timestamp:firebase.database.ServerValue.TIMESTAMP
};
await db.ref(`calls/${partnerId}/${activeCallId}`).set(callData);
listenForIceCandidates(activeCallId,'caller',partnerId);
callRef.on('value',snapshot=>{
const data=snapshot.val();
if(data&&data.answer&&peerConnection.signalingState!=='stable'){
peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
.catch(e=>console.error("Error setting remote description:",e));
}
});
listenForRemoteIceCandidates(activeCallId,'callee');
setupCallUI(currentChatPartner,isVideo,'Calling...');
showView(isVideo?'video-call-view':'voice-call-view');
history.pushState(null,'',window.location.pathname);
}catch(err){
console.error('Error starting call:',err);
showNotification('Could not start call. Check camera/mic permissions.', 5000); // Replaced alert
cleanupCall();
}
}
function listenForIncomingCalls(){
if(callListener)callListener.off();
callListener=db.ref('calls/'+currentUser.uid);
callListener.on('child_added',snapshot=>{
const call=snapshot.val();
if(activeCallId||(currentUserData.blocked&&currentUserData.blocked[call.from])){
db.ref(`calls/${currentUser.uid}/${snapshot.key}`).remove();
return;
}
incomingCallData=call;
db.ref('users/'+call.from).once('value',userSnapshot=>{
const caller=userSnapshot.val();
incomingCallPicWrapper.innerHTML=getProfilePicHTML(caller,'4.5rem');
incomingCallName.textContent=caller.name;
incomingCallType.textContent=`Incoming ${call.isVideo?'video':'voice'} call...`;
showModal('incoming-call-modal');
history.pushState(null,'',window.location.pathname);
ringtone.play();
});
});
callListener.on('child_removed',snapshot=>{
if(incomingCallData&&incomingCallData.callId===snapshot.key){
cleanupCall();
if(history.state){
history.back();
}
}
});
}
acceptCallBtn.addEventListener('click',async()=>{
if(!incomingCallData)return;
activeCallId=incomingCallData.callId;
const isVideo=incomingCallData.isVideo;
ringtone.pause();
showModal('incoming-call-modal',false);
try{
localStream=await navigator.mediaDevices.getUserMedia({
video:isVideo,
audio:true
});
localVideo.srcObject=localStream;
peerConnection=new RTCPeerConnection(rtcConfig);
addLocalTracksToPC();
await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
const answer=await peerConnection.createAnswer();
await peerConnection.setLocalDescription(answer);
await db.ref(`calls/${incomingCallData.from}/${activeCallId}`).update({
answer:answer
});
listenForIceCandidates(activeCallId,'callee',incomingCallData.from);
listenForRemoteIceCandidates(activeCallId,'caller');
db.ref('users/'+incomingCallData.from).once('value',userSnapshot=>{
setupCallUI(userSnapshot.val(),isVideo,'Connected');
showView(isVideo?'video-call-view':'voice-call-view');
history.pushState(null,'',window.location.pathname);
});
logCall(incomingCallData.from,isVideo,'answered');
}catch(err){
console.error('Error accepting call:',err);
cleanupCall();
}
});
rejectCallBtn.addEventListener('click',()=>{
if(!incomingCallData)return;
db.ref(`calls/${currentUser.uid}/${incomingCallData.callId}`).remove();
logCall(incomingCallData.from,incomingCallData.isVideo,'rejected');
cleanupCall();
if(history.state){
history.back();
}
});
videoEndCallBtn.addEventListener('click',endCall);
voiceEndCallBtn.addEventListener('click',endCall);
function endCall(){
if(!activeCallId)return cleanupCall();
let otherUserId=null;
if(incomingCallData){
otherUserId=incomingCallData.from;
}else if(currentChatPartner){
otherUserId=currentChatPartner.uid;
}
if(otherUserId){
db.ref(`calls/${otherUserId}/${activeCallId}`).remove();
db.ref(`calls/${currentUser.uid}/${activeCallId}`).remove();
}
db.ref(`iceCandidates/${activeCallId}`).remove();
cleanupCall();
if(history.state){
history.back();
}
}
function addLocalTracksToPC(){
localStream.getTracks().forEach(track=>{
peerConnection.addTrack(track,localStream);
});
peerConnection.ontrack=event=>{
remoteStream=event.streams[0];
if(remoteVideo.srcObject!==remoteStream){
remoteVideo.srcObject=remoteStream;
remoteAudio.srcObject=remoteStream;
}
};
peerConnection.onconnectionstatechange=()=>{
if(peerConnection.connectionState==='disconnected'||
peerConnection.connectionState==='failed'||
peerConnection.connectionState==='closed'){
endCall();
}
if(peerConnection.connectionState==='connected'){
voiceCallStatus.textContent='Connected';
}
};
}
function listenForIceCandidates(callId,role,otherUserId){
peerConnection.onicecandidate=event=>{
if(event.candidate){
db.ref(`iceCandidates/${callId}/${role}`).push(event.candidate.toJSON());
if(otherUserId){
db.ref(`iceSignals/${otherUserId}/${callId}`).push(event.candidate.toJSON());
}
}
};
}
function listenForRemoteIceCandidates(callId,remoteRole){
db.ref(`iceCandidates/${callId}/${remoteRole}`).on('child_added',snapshot=>{
if(snapshot.exists()&&peerConnection){
peerConnection.addIceCandidate(new RTCSessionDescription(snapshot.val()))
.catch(e=>console.error('Error adding ICE candidate:',e));
}
});
db.ref(`iceSignals/${currentUser.uid}/${callId}`).on('child_added',snapshot=>{
if(snapshot.exists()&&peerConnection){
peerConnection.addIceCandidate(new RTCSessionDescription(snapshot.val()))
.catch(e=>console.error('Error adding ICE candidate (signal):',e));
snapshot.ref.remove();
}
});
}
function setupCallUI(partner,isVideo,status){
if(isVideo){
videoCallerPicWrapper.innerHTML=getProfilePicHTML(partner,'4.5rem');
videoCallerName.textContent=partner.name;
}else{
voiceCallerPicWrapper.innerHTML=getProfilePicHTML(partner,'4.5rem');
voiceCallerName.textContent=partner.name;
voiceCallStatus.textContent=status;
}
}
function logCall(partnerId,isVideo,type){
const callLog={
partnerId:partnerId,
isVideo:isVideo,
type:type,
timestamp:firebase.database.ServerValue.TIMESTAMP
};
db.ref(`callLogs/${currentUser.uid}`).push(callLog);
const partnerLog={...callLog,partnerId:currentUser.uid,type:type==='answered'?'answered':'missed'};
db.ref(`callLogs/${partnerId}`).push(partnerLog);
}
});