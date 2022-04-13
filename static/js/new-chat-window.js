new_chat_cancel_btn.addEventListener('click', function(e){
    e.preventDefault();

    new_chat_window.style.top = '-500px';
});

new_chat_option.addEventListener('click', function(e){
    e.preventDefault();

    new_chat_contacts_container.innerHTML = null;
    for(var contact of contacts){
        if(!contact.active){
            const contact_item = document.createElement('div');
            contact_item.classList.add('contact-item');
            contact_item.setAttribute('data-id', contact.Id);
                const contact_item_name = document.createElement('div');
                contact_item_name.classList.add('contact-item-name');
                contact_item_name.innerHTML = contact.Name;
            contact_item.appendChild(contact_item_name);

            new_chat_contacts_container.appendChild(contact_item);
        }
    }

    const contact_items = new_chat_window.querySelectorAll('.contact-item');
    for(var item of contact_items){
        item.addEventListener('dblclick', function(e){
            e.preventDefault();
    
            const contact_id = this.getAttribute('data-id');
            var contact_name;
    
            for(var contact of contacts){
                if(contact.Id == contact_id){
                    contact_name = contact.Name;
                    break;
                }
            }
    
            const chatlist_item = create_chatlist_item(contact_id, contact_name);
            chatlist_container.appendChild(chatlist_item);
            this.remove();
        });
    }

    new_contact_form.style.top = '-500px';
    new_chat_window.style.top = '20px';
});