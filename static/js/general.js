const signup_form = document.querySelector('.signup-form');
const login_form = document.querySelector('.login-form');
const login_dir = document.querySelector('.login-dir');
const signup_dir = document.querySelector('.signup-dir');

const new_chat_option = document.querySelector('.new_chat_option');
const new_contact_option = document.querySelector('.new_contact_option');
const logout_option = document.querySelector('.logout_option');

const chatlist_container = document.querySelector('.chatlist-container');
const chat_name = document.querySelector('.chat_name');

const message_form = document.querySelector('#message-form');
const messages_container_section = document.querySelector('.messages-container');

const init_page = document.querySelector('.background-chat-section');
const chat_container = document.querySelector('.chat-container');
const chat_profile_img = document.querySelector('.chat_profile-img');

const contact_selector = document.querySelector('.contacts-selector');
const sidenav_btn = document.querySelector('.sidenav_btn')
var hidden = false;

const new_contact_form = document.querySelector('.new_contact');
const new_contact_cancel_btn = new_contact_form.querySelector('.cancel_btn');
const new_contact_contacts_container = new_contact_form.querySelector('.contacts-container');
const alert_messages = document.querySelector('.alert_messages');

const new_chat_window = document.querySelector('.new_chat');
const new_chat_cancel_btn = new_chat_window.querySelector('.cancel_btn');
const new_chat_contacts_container = new_chat_window.querySelector('.contacts-container');


var active_chat = {user_id: "", chat_id: ""};
var general_messages = new Array();
var contacts = new Array();
const socket = io();






// functions

function handle_http(http){
    console.log(`readyState: ${http.readyState}`);
    console.log(`status: ${http.status}`);
}

function set_active_chat(item_id){
    active_chat.chat_id = item_id;
    const chat_items = document.querySelectorAll('.chat-item');
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

function create_chatlist_item(id, name){
    const chat_item = document.createElement('div');
    chat_item.classList.add('chat-item', 'container-fluid');
    chat_item.setAttribute('data-id', id);

        const profile_img_container = document.createElement('div');
        profile_img_container.classList.add('profile_img-container');

            const profile_img = document.createElement('div');
            profile_img.classList.add('profile_img');
            profile_img.innerHTML = name[0];
        profile_img_container.appendChild(profile_img);

        const chat_info_container = document.createElement('div');
        chat_info_container.classList.add('chat-info-container');

            const container_fluid = document.createElement('div');
            container_fluid.classList.add('container-fluid');

                const chat_item_name = document.createElement('div');
                chat_item_name.classList.add('chat-item-name', 'container-fluid');
                    const h6 = document.createElement('h6');
                    h6.innerHTML = name;
                chat_item_name.appendChild(h6);

                const last_message_container = document.createElement('div');
                last_message_container.classList.add('chat-last_msg-container');
                    const div = document.createElement('div');
                last_message_container.appendChild(div);
            container_fluid.appendChild(chat_item_name);
            container_fluid.appendChild(last_message_container);
        chat_info_container.appendChild(container_fluid);
    chat_item.appendChild(profile_img_container);
    chat_item.appendChild(chat_info_container);

    chat_item.addEventListener('click', function(e){
        e.preventDefault();
        init_page.hidden = true;
        chat_container.hidden = false;
        messages_container_section.innerHTML = null;
        const contact_id = this.getAttribute('data-id');
        set_active_chat(contact_id);
        contact_selector.style.left = '-340px';
        sidenav_btn.style.left = '0px';
        hidden = true;

        chat_profile_img.innerHTML = name[0]
        chat_name.innerHTML = name;

        for(var i=0; i<general_messages.length; i++){
            if(general_messages[i].Emiter_id == contact_id || general_messages[i].Receiver_id == contact_id){
                const bubble = create_chat_item(general_messages[i]);
                messages_container_section.appendChild(bubble);
                messages_container_section.scrollTop = messages_container_section.scrollHeight;
            }
        }
    });

    return chat_item;
}



function hide_reveal_sidenav(button){
    if(!hidden) {
        contact_selector.style.left = '-340px';
        button.style.left = '0px';
        hidden = true;
    }else{
        contact_selector.style.left = '0px';
        button.style.left = '340px';
        hidden = false;
    }
}