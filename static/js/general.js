const signup_form = document.querySelector('.signup-form');
const login_form = document.querySelector('.login-form');
const login_dir = document.querySelector('.login-dir');
const signup_dir = document.querySelector('.signup-dir');
const chat_items = document.querySelectorAll('.chat-item');
const chat_name = document.querySelector('.chat_name');
const message_form = document.querySelector('#message-form');
const messages_container_section = document.querySelector('.messages-container');
const init_page = document.querySelector('.background-chat-section');
const chat_container = document.querySelector('.chat-container');
const chat_profile_img = document.querySelector('.chat_profile-img');
const contact_selector = document.querySelector('.contacts-selector');
var hidden = false;


var active_chat = {user_id: "", chat_id: ""};
var chats = new Array();
const socket = io();


function handle_http(http){
    console.log(`readyState: ${http.readyState}`);
    console.log(`status: ${http.status}`);
}

function set_active_chat(item_id){
    active_chat.chat_id = item_id;
    for(var item of chat_items){
        const user_id = item.getAttribute('data-id');
        if(user_id == item_id){
            item.classList.add('active-chat');
        }else{
            item.classList.remove('active-chat');
        }
    }
}

function create_chat_item(msg){
    const message_container = document.createElement('div');
    if(msg.Emiter_id == localStorage.getItem('user_id')){
        message_container.classList.add("message-item-container", "own-message");
    }else{
        message_container.classList.add("message-item-container", "contact-message");
    }

        const message_item = document.createElement('div');
        message_item.classList.add("message-item");
        message_item.innerHTML = msg.Message;
    message_container.appendChild(message_item);

    return message_container;
}

function hide_reveal_sidenav(button){
    if(!hidden) {
        contact_selector.style.left = '-350px';
        button.style.left = '0px';
        hidden = true;
    }else{
        contact_selector.style.left = '0px';
        button.style.left = '350px';
        hidden = false;
    }
}