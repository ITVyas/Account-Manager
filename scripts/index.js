window.addEventListener('load', async () => {
    UILogic.addUILogic();
    FormLogic.addFormLogic();
    UnpackForm.addUnpackLogic();
});

const LocalPasswordStorage = (() => {
    function initLocalPasswordStorage(Keys) {
        const groups = window.localStorage.getItem(Keys.Groups);
        if(!groups) window.localStorage.setItem(Keys.Groups, '["All"]');
    
        const records = window.localStorage.getItem(Keys.Records);
        if(!records) window.localStorage.setItem(Keys.Records, '[]');
    }

    const Keys = {
        Groups: 'bbf8b4e1cdd6526cd1e00d28986c10df301f64ad3bcfe138aabde0be807e8fad',
        Records: '1205cf1cbaa508691dc58c268828aea5f93bb76f445820430a01e2f5a9ba717a'
    };

    initLocalPasswordStorage(Keys);
    
    return {
        addGroup: (groupName) => {
            const groups = JSON.parse(window.localStorage.getItem(Keys.Groups));
            if(groups.findIndex(x => x === groupName) === -1) {
                groups.push(groupName);
                window.localStorage.setItem(Keys.Groups, JSON.stringify(groups));
                return 1;
            } 
            return 0;
        },

        getAllGroups: () => {
            return JSON.parse(window.localStorage.getItem(Keys.Groups));
        },

        removeGroup: (groupName) => {
            const groups = JSON.parse(window.localStorage.getItem(Keys.Groups));
            const index = groups.findIndex(x => x === groupName);
            if(index !== -1 && groupName !== 'All') {
                groups.splice(index, 1);
                window.localStorage.setItem(Keys.Groups, JSON.stringify(groups));

                (async () => {
                    const records = JSON.parse(window.localStorage.getItem(Keys.Records));
                    records.forEach(r => r.groups = r.groups.filter(x => x !== groupName));
                    window.localStorage.setItem(Keys.Records, JSON.stringify(records));
                })();
                
                return 1;
            } else {
                return 0;
            }
        },

        isGroupExisting: (groupName) => {
            const groups = JSON.parse(window.localStorage.getItem(Keys.Groups));
            const index = groups.findIndex(x => x === groupName);
            return index !== -1;
        },

        renameGroup(groupName, newName) {
            const groups = JSON.parse(window.localStorage.getItem(Keys.Groups));
            const index = groups.findIndex(x => x === groupName);
            if(index !== -1 && groupName !== 'All') {
                groups[index] = newName;
                const records = JSON.parse(window.localStorage.getItem(Keys.Records));
                records.forEach(r => {
                    const index = r.groups.findIndex(x => x === groupName);
                    if(index !== -1) r.groups[index] = newName;
                });
                window.localStorage.setItem(Keys.Groups, JSON.stringify(groups));
                window.localStorage.setItem(Keys.Records, JSON.stringify(records));
                
                return 1;
            } else {
                return 0;
            }
        },

        addRecord: (record) => {
            const records = JSON.parse(window.localStorage.getItem(Keys.Records));

            const maxId = records.reduce((acc, rec) => {
                if(acc < rec.id) return rec.id;
                else return acc;
            }, -1);
            record.id = maxId + 1;
            records.push(record);
            window.localStorage.setItem(Keys.Records, JSON.stringify(records));
            return 1;
        },

        updateRecord: (record) => {
            const records = JSON.parse(window.localStorage.getItem(Keys.Records));
            const index = records.findIndex(rec => rec.id === record.id);
            if(index !== -1) {
                records[index] = record;
                window.localStorage.setItem(Keys.Records, JSON.stringify(records));
                return 1;
            } else {
                return 0;
            }
        },

        removeRecordById: (recordId) => {
            const records = JSON.parse(window.localStorage.getItem(Keys.Records));
            const index = records.findIndex(record => record.id === recordId);
            if(index !== -1) {
                records.splice(index, 1);
                window.localStorage.setItem(Keys.Records, JSON.stringify(records));
                return 1;
            } else {
                return 0;
            }
        },

        deleteAllRecords: () => {
            window.localStorage.setItem(Keys.Records, JSON.stringify([]));
        },

        filterRecords: (predicate) => {
            const records = JSON.parse(window.localStorage.getItem(Keys.Records));
            return records.filter(predicate);
        },

        sliceRecords: (start, end) => {
            const records = JSON.parse(window.localStorage.getItem(Keys.Records));
            return records.slice(start, end);
        }
    };
})();

String.prototype.capitalize = function() {
    let value = this.toLowerCase();
    value = value[0].toUpperCase() + value.slice(1);
    return value;
};

const Utility = {
    isHiddenExplicitly(el) {
        return el.style.display === 'none';
    },
    hideElement(el) {
        el.style.display = 'none';
    },

    hideElements(...elements) {
        elements.forEach(Utility.hideElement);
    },

    showElement(el) {
        el.style.removeProperty('display');
    },

    showElements(...elements) {
        elements.forEach(Utility.showElement);
    },

    removeContent(el) {
        el.innerHTML = "";
    },

    getExisting(value, ifNotExists) {
        if(value === undefined || value === null) return value;
        return ifNotExists;
    },

    calcStringAndTagsSimilarity(str, tags) {
        const strTags = str.toLowerCase().split(' ').filter(x => x);
        return strTags.reduce((acc, strTag, i) => {
            if(i > 0 && acc === 0) return 0;
            if(i !== strTags.length - 1) {
                const index = tags.findIndex(x => x === strTag);
                if(index === -1) return 0;
                else return 1;
            }
            if(tags.findIndex(x => x === strTag) !== -1) return 1;
            if(tags.findIndex(tag => tag.startsWith(strTag)) !== -1) return 0.5;
            return 0;
        }, 0);
    },

    sum: (arr) => arr.reduce((acc, val) => acc+val, 0),

    exists(value) {
        return typeof(value) !== undefined && value !== null;
    }
};

const FormLogic = {
    emptyRecordForm() {
        const form = document.getElementById('new-form-record');
        form.reset();
        Utility.removeContent(document.getElementById('groups-for-pick'));
        Utility.removeContent(document.getElementById('tags-container'));
        Array.from(document.querySelectorAll(['.custom', '.form-reject-message', 'input[name="groups[]"]'])).forEach(x => x.remove());
        Array.from(document.querySelectorAll('input.focus')).forEach(x => x.classList.remove('focus'));
    },

    resetRecordForm() {
        FormLogic.emptyRecordForm();

        const defaultFields = [FormLogic.createField('Login', 'text'), FormLogic.createField('Email', 'text'), FormLogic.createField('Password', 'password')];
        document.getElementById('fields-scrollable-container').append(...defaultFields);
    },
    
    addFormCancellingLogic() {
        document.getElementById('form-close-btn').addEventListener('click', (e) => {
            Utility.hideElement(document.getElementById('form-and-bg-container'));
            FormLogic.resetRecordForm();
        });
    },

    createTagElement(value) {
        const tagElement = document.createElement('div');
        const i = document.createRange().createContextualFragment('<i class="fa-solid fa-xmark"></i>');
        const textSpan = document.createElement('span');
        textSpan.textContent = value;
        tagElement.classList.add('tag');
        tagElement.append(textSpan, i);

        tagElement.addEventListener('mouseover', () => {
            tagElement.onclick = () => tagElement.remove();
            textSpan.style.visibility = 'hidden';
        });

        tagElement.addEventListener('mouseout', () => {
            tagElement.onclick = null;
            textSpan.style.visibility = 'visible';
        });
        return tagElement;
    },
    
    addAddTagBtnLogic() {
        const btn = document.querySelector('#tag-input-container i');
        const input = document.querySelector('#tag-input-container input');
        const tagsContainer = document.getElementById('tags-container');
        btn.addEventListener('click', () => {
            const value = input.value.trim().toLowerCase();
            if(!value) return;
            input.value = "";
            const tagElement = FormLogic.createTagElement(value);
            tagsContainer.append(tagElement);
        });
    
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                btn.dispatchEvent(new Event('click'));
                e.preventDefault();
            }
        });
    },
    
    createField(name, type) {
        const newInputContainer = document.createElement('div');
        newInputContainer.classList.add('input-text', 'custom');
        const label = document.createElement('label');
        label.textContent = name;
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.name = name.toLowerCase();
        newInput.classList.add('form-text-input');
        const removeFieldBtn = document.createElement('div');
        removeFieldBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeFieldBtn.classList.add('remove-field-btn');
        removeFieldBtn.onclick = () => newInputContainer.remove();

        if(type === 'password') {
            newInput.type = 'password';
            newInput.classList.add('password');
            newInputContainer.classList.add('password');

            const hidePasswordBtn = document.createElement('i');
            hidePasswordBtn.classList.add("fa-regular", "fa-eye");

            hidePasswordBtn.addEventListener('click', () => {
                hidePasswordBtn.classList.toggle("fa-regular");
                hidePasswordBtn.classList.toggle("fa-solid");
                if(hidePasswordBtn.classList.contains('fa-solid')) newInput.type = 'text';
                else newInput.type = 'password';
            });

            newInputContainer.append(hidePasswordBtn);
        }

        newInputContainer.append(label, newInput, removeFieldBtn);

        return newInputContainer;
    },
    
    addNewFieldLogic() {
        const plusBtn = document.querySelector('#add-field-container i.fa-plus');
        const lockBtn = document.querySelector('#add-field-container i.fa-lock');
        const input = document.querySelector('form input[name="new-field-name"]');
    
        plusBtn.addEventListener('mousedown', (e) => e.preventDefault());
        lockBtn.addEventListener('mousedown', (e) => e.preventDefault());

        const addInput = (e) => {
            let value = input.value.trim();
            if(value === '') return;
            value = value.capitalize();
            if(document.querySelector(`input[name="${value.toLowerCase()}"]`)) {
                FormLogic.showRejectMsgAndFocusInput("This field name already exists", input, 2500);
                return;
            }
    
            input.value = "";
            const container = document.getElementById('fields-scrollable-container');
            const type = e.target === plusBtn ? "text" : "password";
            const newField = FormLogic.createField(value, type);
    
            container.append(newField);
        };
        
        plusBtn.addEventListener('click', addInput);
        lockBtn.addEventListener('click', addInput);
    
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                plusBtn.dispatchEvent(new Event('click'));
            }
        })
    },

    createFormRejectMsgEl(text) {
        const msgEl = document.createElement('div');
        msgEl.textContent = `❗ ${text} ❗`;
        msgEl.classList.add('form-reject-message');
        return msgEl;
    },
    
    showRejectMsgAndFocusInput(msgText, input, msgMsTime=3000) {
        Array.from(document.querySelectorAll('.form-reject-message')).forEach(x => x.remove());
        const msgEl = FormLogic.createFormRejectMsgEl(msgText);
        document.getElementById('save-btn-container').append(msgEl);
    
        if(!Array.isArray(input)) input.classList.add('focus');
        else input.forEach(i => i.classList.add('focus'));
            
    
        const removeFocusClass = () => {
            if(!Array.isArray(input)) input.classList.remove('focus');
            else input.forEach(i => i.classList.remove('focus'));
    
            if(!Array.isArray(input)) input.removeEventListener('click', removeFocusClass);
            else input.forEach(i => i.removeEventListener('click', removeFocusClass));

            if(!Array.isArray(input)) input.removeEventListener('input', removeFocusClass);
            else input.forEach(i => i.removeEventListener('input', removeFocusClass));
    
            document.getElementById('save-record-btn').removeEventListener('click', actionWhileMsgShown);
            clearTimeout(id);
            msgEl.remove();
        };
    
        if(!Array.isArray(input)) input.addEventListener('click', removeFocusClass);
        else input.forEach(i => i.addEventListener('click', removeFocusClass));

        if(!Array.isArray(input)) input.addEventListener('input', removeFocusClass);
        else input.forEach(i => i.addEventListener('input', removeFocusClass));
    
        var actionWhileMsgShown = (e) => {
            clearTimeout(id);
            msgEl.remove();
            document.getElementById('save-record-btn').removeEventListener('click', actionWhileMsgShown);
        };
    
        var id = setTimeout(() => {
            msgEl.remove();
            document.getElementById('save-record-btn').removeEventListener('click', actionWhileMsgShown);
        }, msgMsTime);
    
        setTimeout(() => {
            document.getElementById('save-record-btn').addEventListener('click', actionWhileMsgShown);
        }, 0);
    },
    
    validateTitleField() {
        const input = document.querySelector('input[name="title"]');
        const value = input.value.trim();
        if(!value) {
            FormLogic.showRejectMsgAndFocusInput('Fill «Title» field', input);
            return false;
        }   
        return true;
    },
    
    validateKeyPhraseField() {
        const input = document.querySelector('input[name="key phrase"]');
        const passwordInputs = Array.from(document.querySelectorAll('input.password'));
        input.required = passwordInputs.reduce((acc, input) => {
            if(acc || input.value) return true;
            return false;
        }, false);
    
        if(!input.checkValidity()) {
            FormLogic.showRejectMsgAndFocusInput('Enter key phrase from 5 to 32 symbols', input, 5000);
            return false;
        }
        return true;
    },
    
    validateRecordFields() {
        const recordInputs = document.querySelectorAll('#new-form-record #fields-scrollable-container input:not(.key-phrase, .title)');
        const recordInputsArr = Array.from(recordInputs);
        const areAllEmpty = recordInputsArr.reduce((acc, input) => {
            if(!acc) return false;
            return !input.value.trim() && !input.matches('.password:placeholder-shown');
        }, true);
    
        if(areAllEmpty) {
            FormLogic.showRejectMsgAndFocusInput('Fill at least 1 record field', recordInputsArr, 3500);
            return false;
        }   
        return true;
    },
    
    validateForm() {
        const validationQueue = [FormLogic.validateTitleField, FormLogic.validateKeyPhraseField, FormLogic.validateRecordFields];
        return validationQueue.reduce((acc, validation) => {
            if(!acc) return false;
            return validation();
        }, true);
    },

    collectFormData(deleteEmptyValues = true) {
        let inputFields = Array.from(document.querySelectorAll('#fields-scrollable-container input'));
        const record = {
            "title": null,
            "text": [],
            "password": [],
            "key phrase": null,
            "groups": ['All'],
            "tags": []
        };
        
        if(deleteEmptyValues) inputFields = inputFields.filter(input => input.value !== "");
        inputFields.forEach(input => {
            if(input.classList.contains('password')) record["password"].push({"name": input.name, "value": input.value});
            else if(input.classList.contains('key-phrase')) record["key phrase"] = input.value;
            else if(input.classList.contains('title')) record["title"] = input.value;
            else record["text"].push({"name": input.name, "value": input.value});
        });
    
        record.tags.push(...record['title'].split(' ').map(x => x.toLowerCase()));
        record.tags.push(...Array.from(document.querySelectorAll('#tags-container .tag')).map(x => x.textContent));

        record.groups.push(...Array.from(document.querySelectorAll('#groups-container input[name="groups[]"]')).map(x => x.value));
    
        return record;
    },
    
    submitNewRecord() {
        const valid = FormLogic.validateForm();
        if(!valid) return false;
        
        const record = FormLogic.collectFormData();
    
        if(record['password'].length > 0) {
            const passwordObjs = record['password'];
            const promises = passwordObjs.map(passwordObj => {
                return Encryption.encryptAESGCM(passwordObj.value, record['key phrase']).then(IVandEncryptedPassword => {
                    return {
                        name: passwordObj.name,
                        value: IVandEncryptedPassword.encryptedPassword,
                        IV: IVandEncryptedPassword.IV
                    };
                });
            });
            Promise.all(promises).then(results => {
                record['password'] = results;
                delete record['key phrase'];
                LocalPasswordStorage.addRecord(record);
                UILogic.loadCurrentPage();
            });
        } else {
            if(record['key phrase']) delete record['key phrase'];
            LocalPasswordStorage.addRecord(record);
            UILogic.loadCurrentPage();
        }
        
        Utility.hideElement(document.getElementById('new-form-record').parentElement);
        FormLogic.resetRecordForm();
        return false;
    },
    
    submitUpdateRecord(oldData) {
        const valid = FormLogic.validateForm();
        if(!valid) return false;
        const record = FormLogic.collectFormData(deleteEmptyValues = false);
        record['text'] = record['text'].filter(obj => obj.value !== '');
        const newPasswords = record['password'];
        record['password'] = [];

        (async () => {
            const promises = newPasswords.map(passwordObj => {
                if(passwordObj.value === '') {
                    const index = oldData['password'].findIndex(obj => obj.name === passwordObj.name);
                    if(index !== -1) return Promise.resolve(oldData['password'][index]);
                    else return Promise.resolve(null);
                }
                return Encryption.encryptAESGCM(passwordObj.value, record['key phrase']).then(encryptObj => {
                    return {
                        name: passwordObj.name,
                        value: encryptObj.encryptedPassword,
                        IV: encryptObj.IV
                    };
                });
            });

            record['password'] = (await Promise.all(promises)).filter(x => x !== null);
            delete record['key phrase'];
            record.id = oldData.id;
            LocalPasswordStorage.updateRecord(record);
            UILogic.loadCurrentPage();
        })();

        Utility.hideElement(document.getElementById('new-form-record').parentElement);
        FormLogic.resetRecordForm();

        return false;
    },

    addKeyPhraseShowHideLogic() {
        const hidePasswordBtn = document.querySelector('.input-text.key-phrase i.fa-eye');
        const input = document.querySelector('.form-text-input.key-phrase');
        hidePasswordBtn.addEventListener('click', () => {
            hidePasswordBtn.classList.toggle("fa-regular");
            hidePasswordBtn.classList.toggle("fa-solid");
            if(hidePasswordBtn.classList.contains('fa-solid')) input.type = 'text';
            else input.type = 'password';
        });
    },

    addGroupsToForm() {
        const groups = LocalPasswordStorage.getAllGroups().slice(1);
        const groupsContainer = document.getElementById('groups-for-pick');
        const groupInputsContainer = document.getElementById('groups-container');

        const groupElements = groups.map(group => {
            const formGroupEl = document.createElement('div');
            formGroupEl.classList.add('picking-group');
            formGroupEl.innerHTML = group;

            const input = document.createElement('input');
            input.value = group;
            input.name = 'groups[]';
            Utility.hideElement(input);

            const switchOn = () => {
                formGroupEl.classList.toggle('active');
                groupInputsContainer.append(input);
                formGroupEl.onclick = switchOff;
            };

            const switchOff = () => {
                formGroupEl.classList.toggle('active');
                input.remove();
                formGroupEl.onclick = switchOn;
            };

            formGroupEl.onclick = switchOn;
            return formGroupEl;
        });

        Utility.removeContent(groupsContainer);
        groupsContainer.append(...groupElements);
    },
    
    addFormLogic() {
        UILogic.addOpenNewRecordFormLogic();
        FormLogic.resetRecordForm();
        FormLogic.addFormCancellingLogic();
        FormLogic.addAddTagBtnLogic();
        FormLogic.addNewFieldLogic();
        FormLogic.addKeyPhraseShowHideLogic();
    }
};

const UILogic = {
    Status : {
        Group: 'All',
        Page: 1,
        PageCapacity: 7,
        MaxPage: 1
    },

    addActiveSwitchingForButton(btn) {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
    },

    addOpenNewRecordFormLogic() {
        const form = document.getElementById('new-form-record');
        document.getElementById('add-record-btn').addEventListener('click', () => {
            document.getElementById('save-record-btn').onclick = FormLogic.submitNewRecord;
            FormLogic.addGroupsToForm();
            Utility.showElement(form.parentElement);
        });
    },

    addInputTrimLogic() {
        Array.from(document.querySelectorAll('input:not([name="password"],[name="key phrase"])')).forEach(
            input => input.addEventListener('focusout', () => input.value = input.value.trim())
        );
    },

    showSidebarGroups(activeGroup) {
        if(activeGroup) {
            UILogic.Status.Group = activeGroup;
        } else {
            activeGroup = UILogic.Status.Group;
        }
        const groupsContainer = document.getElementById('groups');
        const groups = LocalPasswordStorage.getAllGroups();
        const groupElements = groups.map((group, i) => {
            const groupEl = document.createElement('div');
            groupEl.textContent = group;
            groupEl.classList.add('group');
            if(i === 0) groupEl.classList.add('all');
            if(activeGroup && group === activeGroup) groupEl.classList.add('active');
            
            groupEl.addEventListener('click', () => {
                if(UILogic.Status.Group === group || groupEl.querySelector('input')) return;
                UILogic.showSidebarGroups(group);
                UILogic.loadCurrentPage();
            });
            const options = [];
            const actions = [];

            if(group !== activeGroup) {
                options.push('Switch on');
                actions.push(() => {
                    UILogic.showSidebarGroups(group);
                    UILogic.loadCurrentPage();
                });
            }
            if(i !== 0) {
                options.push('Rename');
                actions.push(() => {
                    const input = document.createElement('input');
                    input.classList.add('group-rename-input');
                    input.value = group;
                    Utility.removeContent(groupEl);
                    groupEl.append(input);
                    input.focus();

                    const saveChanges = () => {
                        const value = input.value.trim();
                        if(value) {
                            input.value = value.capitalize();
                            if(!LocalPasswordStorage.isGroupExisting(input.value)) {
                                LocalPasswordStorage.renameGroup(group, input.value);
                                group = input.value;
                            } else {
                                UILogic.showSidebarGroups(input.value);
                                UILogic.loadCurrentPage();
                            }
                        }
                        input.remove();
                        groupEl.textContent = group;
                    };

                    input.addEventListener('keydown', (e) => {
                        if(e.key === 'Enter') {
                            saveChanges();
                            document.removeEventListener('mousedown', documentClickSave);
                        }
                    });

                    const documentClickSave = (e) => {
                        if(!groupEl.matches(':hover')) {
                            e.preventDefault();
                            const action = () => {
                                if(!groupEl.matches(':hover')) {
                                    saveChanges();
                                    document.removeEventListener('mousedown', documentClickSave);
                                }
                                document.removeEventListener('mouseup', action);
                            };
                            document.addEventListener('mouseup', action);
                        }
                    };
                    setTimeout(() => document.addEventListener('mousedown', documentClickSave), 0);
                });
                options.push('Remove');
                actions.push(() => {
                    LocalPasswordStorage.removeGroup(group);
                    if(group === activeGroup) {
                        UILogic.showSidebarGroups('All');
                        UILogic.loadCurrentPage();
                    } else {
                        UILogic.showSidebarGroups();
                    }
                        
                    UILogic.loadCurrentPage();
                });
            }

            UILogic.addContextMenuToElement(
                groupEl,
                options,
                actions
            );

            return groupEl;
        });
        Utility.removeContent(groupsContainer);
        groupsContainer.append(...groupElements);
    },
    
    addNewGroupLogic() {
        const btn = document.getElementById('add-new-group');
        const input = document.getElementById('new-group-name');
    
        btn.addEventListener('click', () => {
            const val = input.value.trim();
            if(!val) return;
            const newGroupName = val.capitalize();
            const result = LocalPasswordStorage.addGroup(newGroupName);
            if(result === 1) UILogic.showSidebarGroups(UILogic.Status.Group);
            else {
                UILogic.Status.Group = newGroupName;
                UILogic.showSidebarGroups(newGroupName);
                UILogic.loadCurrentPage();
            }
            input.value = "";
        });
    
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                btn.dispatchEvent(new Event('click'));
            }
        });
    },

    createPasswordButton(name, encryptedPassword, IV) {
        const passwordBtnContainer = document.createElement('div');
        passwordBtnContainer.classList.add('additional-part-button-container');

        const recordCopyPassword = document.createElement('button');
        recordCopyPassword.classList.add('record-copy-password');
        recordCopyPassword.innerHTML = `<i class="fa-regular fa-copy"></i>`;
        const recordCopyPasswordNameEl = document.createElement('div');
        recordCopyPasswordNameEl.textContent = name.capitalize();
        recordCopyPasswordNameEl.classList.add('record-copy-password-name');
        recordCopyPassword.append(recordCopyPasswordNameEl);

        passwordBtnContainer.append(recordCopyPassword);

        recordCopyPassword.addEventListener('click', async () => {
            const userKeyPhrase = document.getElementById('key-phrase').value;
            const password = await Encryption.decryptAESGCM(encryptedPassword, userKeyPhrase,IV);
            if(password)
                navigator.clipboard.writeText(password);
            else 
                navigator.clipboard.writeText(await Encryption.getHash(encryptedPassword + userKeyPhrase, 16));

            recordCopyPassword.querySelector('i').classList.toggle('fa-regular');
            recordCopyPassword.querySelector('i').classList.toggle('fa-solid');
            const id = setTimeout(() => {
                recordCopyPassword.querySelector('i').classList.toggle('fa-regular');
                recordCopyPassword.querySelector('i').classList.toggle('fa-solid');
                document.body.removeEventListener('click', resetIcon);
            }, 1000);
            const resetIcon = () => {
                clearTimeout(id);
                recordCopyPassword.querySelector('i').classList.toggle('fa-regular');
                recordCopyPassword.querySelector('i').classList.toggle('fa-solid');
                document.body.removeEventListener('click', resetIcon);
            };

            document.body.addEventListener('click', resetIcon);
        });
        return passwordBtnContainer;
    },

    createDeleteVerificationWindow(actionYes, actionNo) {
        const verificationWindow = document.createElement('div');
        verificationWindow.classList.add('record-delete-verification-window');

        const yesBtn = document.createElement('button');
        yesBtn.classList.add('delete-yes');
        yesBtn.textContent = 'yes';
        yesBtn.addEventListener('click', actionYes);

        const noBtn = document.createElement('button');
        noBtn.classList.add('delete-no');
        noBtn.textContent = 'no';
        noBtn.addEventListener('click', actionNo);

        const btnsContainer = document.createElement('div');
        btnsContainer.classList.add('record-delete-btns');
        btnsContainer.append(yesBtn, noBtn);

        verificationWindow.textContent = `Confirm you delete this record`;
        verificationWindow.append(btnsContainer);
        return verificationWindow;
    },

    createDeleteRecordBtn(id) {
        const btn = document.createElement('div');
        btn.classList.add('record-remove-btn');

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-trash');

        btn.addEventListener('mousedown', (e) => e.preventDefault()); 
        btn.addEventListener('click', (e) => {
            const existingConfirmation = btn.querySelector('.record-delete-verification-window');
            if(existingConfirmation && existingConfirmation.matches(':hover')) return;
            
            if(!existingConfirmation) {
                const confirmationWindow = UILogic.createDeleteVerificationWindow(
                    () => setTimeout(() => {
                        LocalPasswordStorage.removeRecordById(id);
                        UILogic.loadCurrentPage();
                    }, 0),
                    () => setTimeout(() => confirmationWindow.remove(), 0)
                );
                btn.append(confirmationWindow);

                const closeOnClick = () => {
                    if(!btn.matches(':hover') && !confirmationWindow.matches(':hover')) {
                        document.removeEventListener('click', closeOnClick);
                        confirmationWindow.remove();
                    }
                };

                document.addEventListener('click', closeOnClick);
                
            } else existingConfirmation.remove();
        });

        btn.append(icon);
        return btn;
    },

    createEditRecordBtn(data) {
        const btn = document.createElement('div');
        btn.classList.add('record-edit-btn');

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-pen-to-square');

        btn.addEventListener('click', () => {
            const formContainer = document.getElementById('form-and-bg-container');
            const form = document.getElementById('new-form-record');
            const fieldsContainer = document.getElementById('fields-scrollable-container');
            const tagsContainer = document.getElementById('tags-container');
            FormLogic.emptyRecordForm();
            FormLogic.addGroupsToForm();

            const titleInput = formContainer.querySelector('.form-text-input.title');
            titleInput.value = data['title'];

            data['text'].forEach(obj => {
                const field = FormLogic.createField(obj.name.capitalize(), 'text');
                field.querySelector('input').value = obj.value;
                fieldsContainer.append(field);
            });

            data['password'].forEach(obj => {
                const field = FormLogic.createField(obj.name.capitalize(), 'password');
                field.querySelector('input').placeholder = 'Leave empty for no change';
                fieldsContainer.append(field);
            });

            const groupElementMap = {};
            Array.from(document.querySelectorAll('.picking-group')).forEach(element => groupElementMap[element.textContent] = element);

            data['groups'].forEach(group => {
                if(group !== 'All') groupElementMap[group].dispatchEvent(new Event('click'));
            });

            tagsContainer.append(...data['tags'].slice(data['title'].split(' ').length).map(FormLogic.createTagElement))

            Utility.showElement(formContainer);
            document.getElementById('save-record-btn').onclick = () => FormLogic.submitUpdateRecord(data);
        });

        btn.append(icon);
        return btn;
    },

    createEditAndDeleteBlock(data) {
        const block = document.createElement('div');
        block.classList.add('edit-and-delete-block');
        block.append(UILogic.createEditRecordBtn(data), UILogic.createDeleteRecordBtn(data.id));
        return block;
    },

    addContextMenuToRecordElement(recordElement, data) {
        const groups = data.groups;
        if(UILogic.Status.Group === 'All') {
            

            const menuMeta = {
                getOptions: () => {
                    const allGroups = LocalPasswordStorage.getAllGroups();
                    const notPresentGroups = allGroups.filter(x => !groups.includes(x));
                    return notPresentGroups.map(group => `Add to ${group.capitalize()}`)
                },
                getActions: () => {
                    const allGroups = LocalPasswordStorage.getAllGroups();
                    const notPresentGroups = allGroups.filter(x => !groups.includes(x));
                    return notPresentGroups.map(group => {
                        return () => {
                            data.groups.push(group);
                            LocalPasswordStorage.updateRecord(data);
                        };
                    })
                } 
            };

            UILogic.addContextMenuToElement(recordElement, null, null, menuMeta);
        } else {
            UILogic.addContextMenuToElement(recordElement, [`Remove from ${UILogic.Status.Group}`], [() => {
                const index = data.groups.findIndex(x => x === UILogic.Status.Group);
                data.groups.splice(index, 1);
                LocalPasswordStorage.updateRecord(data);
                UILogic.loadCurrentPage();
            }]);
        }
    },

    createRecordElement(data) {
        const record = document.createElement('div');
        record.classList.add('record');

        const editAndDeleteBlock = UILogic.createEditAndDeleteBlock(data);
        Utility.hideElement(editAndDeleteBlock);

        const recordTitle = document.createElement('div');
        recordTitle.textContent = data['title'];
        recordTitle.classList.add('record-title');

        const recordLogin = document.createElement('div');
        recordLogin.classList.add('record-login');

        if(data['text'].length > 0) recordLogin.textContent = data.text[0].value;

        let recordCopyPassword = document.createElement('span');
        if(data['password'].length > 0) {
            recordCopyPassword = UILogic.createPasswordButton(data['password'][0].name, data['password'][0].value, data['password'][0].IV); 
        }

        const additional = UILogic.createRecordAdditionalPart(data);
        
        const showMoreEl = document.createElement('div');
        showMoreEl.classList.add('show-more');

        const showMoreI = document.createElement('i');
        showMoreI.classList.add('fa-solid', 'fa-chevron-up');

        showMoreEl.append(showMoreI);

        showMoreEl.addEventListener('mousedown', (e) => e.preventDefault());
        
        showMoreEl.addEventListener('click', (e) => {
            showMoreI.classList.toggle('fa-chevron-up');
            showMoreI.classList.toggle('fa-chevron-down');

            if(showMoreI.classList.contains('fa-chevron-up')) {
                Utility.hideElements(additional, editAndDeleteBlock);
                Utility.showElements(recordLogin, recordCopyPassword);
                recordTitle.style.removeProperty('grid-column');
            } else {
                Utility.showElements(additional, editAndDeleteBlock);
                Utility.hideElements(recordLogin, recordCopyPassword);
                recordTitle.style.gridColumn = 'span 2';
            } 
        });

        record.append(recordTitle, recordLogin, recordCopyPassword, showMoreEl);
        record.append(additional);
        record.append(editAndDeleteBlock);
        UILogic.addContextMenuToRecordElement(record, data);
        return record;
    },

    showCurrentPageElements() {
        const searchValue = document.getElementById('search-record').value.trim();
        let pageRecords, maxN;
        if(!searchValue) {
            pageRecords = LocalPasswordStorage.filterRecords(rec => rec['groups'].includes(UILogic.Status.Group));
            maxN = pageRecords.length;
            pageRecords = pageRecords.slice((UILogic.Status.Page - 1)*UILogic.Status.PageCapacity, UILogic.Status.Page*UILogic.Status.PageCapacity);
        } else {
            pageRecords = LocalPasswordStorage.filterRecords(rec => {
                if(!rec['groups'].includes(UILogic.Status.Group)) return false;
                rec['similarity'] = Utility.calcStringAndTagsSimilarity(searchValue, rec.tags);
                return rec['similarity'] > 0;
            });
            maxN = pageRecords.length;
            pageRecords = pageRecords.slice((UILogic.Status.Page - 1)*UILogic.Status.PageCapacity, UILogic.Status.Page*UILogic.Status.PageCapacity);
            pageRecords.sort((a, b) => b['similarity'] - a['similarity']);
        }
        
        const pageRecordElements = pageRecords.map(UILogic.createRecordElement);
        const contentContainer = document.getElementById('records-container');
        Utility.removeContent(contentContainer);
        contentContainer.append(...pageRecordElements);
        return [pageRecords.length, maxN];
    },

    addSearchInputLogic() {
        const input = document.getElementById('search-record');
        input.addEventListener('input', () => {
            UILogic.Status.Page = 1;
            UILogic.loadCurrentPage();
        });
    },

    loadCurrentPage() {
        const [showedN, maxN] = UILogic.showCurrentPageElements();
        UILogic.Status.MaxPage = Math.max(1, Math.ceil(maxN/UILogic.Status.PageCapacity))
        if(showedN === 0 && UILogic.Status.Page > 1) {
            UILogic.Status.Page -= 1;
            UILogic.loadCurrentPage();
            return;
        }
        UILogic.showCurrentPagination();
    },

    addUILogic() {
        UILogic.addActiveSwitchingForButton(document.getElementById('sidebar-switch'));
        UILogic.addInputTrimLogic();
        UILogic.showSidebarGroups(UILogic.Status.Group);
        document.getElementById('sidebar-switch').dispatchEvent(new Event('click'));
        UILogic.addNewGroupLogic();
        UILogic.addSearchInputLogic();
        UILogic.addExtraOptionsLogic();
        UILogic.addKeyPhraseInputLogic();
        UILogic.loadCurrentPage();
        UILogic.addClearKeyPhraseAfterInactivityLogic();
    },

    async showCurrentPagination() {
        const pagination = document.getElementById('pagination');
        Utility.removeContent(pagination);

        const curPage = UILogic.Status.Page, maxPage = UILogic.Status.MaxPage;
        const paginationPages = [];
        for(let page = curPage - 2; paginationPages.length < 5; page++) {
            if(page >= 1) paginationPages.push(page);
        }

        const prevBtn = document.createElement('div');
        prevBtn.addEventListener('click', () => {
            UILogic.Status.Page -= 1;
            UILogic.loadCurrentPage();
        });
        prevBtn.classList.add('page');
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        if(curPage === 1) prevBtn.classList.add('disabled');
        pagination.append(prevBtn);

        pagination.append(...paginationPages.map((pageNumber) => {
            const page = document.createElement('div');
            page.textContent = pageNumber;
            page.classList.add('page');
            if(pageNumber === curPage) page.classList.add('active');
            if(pageNumber > maxPage) {
                page.classList.add('disabled');
            } else {
                page.addEventListener('click', () => {
                    UILogic.Status.Page = pageNumber;
                    UILogic.loadCurrentPage();
                });
            }
            return page;
        }));

        const nextBtn = document.createElement('div');
        nextBtn.classList.add('page');
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        if(curPage === maxPage) nextBtn.classList.add('disabled');
        nextBtn.addEventListener('click', () => {
            UILogic.Status.Page += 1;
            UILogic.loadCurrentPage();
        });
        pagination.append(nextBtn);
    },

    addWidthForTopBarInputs() {
        const inputs = document.getElementById('top-bar-inputs-animation');
        const width = inputs.scrollWidth;
        inputs.style.width = `${width}px`;
        return width;
    },

    addWidthForExtraMenu() {
        const menu = document.getElementById('extra-menu-options-animation');
        menu.style.display = 'block';
        const width = menu.scrollWidth;
        menu.style.width = `${width}px`;
        menu.style.removeProperty('display');
        return width;
    },

    addOpenExtraMenuLogic() {
        const openMenuBtn = document.getElementById('extra-menu');
        UILogic.addActiveSwitchingForButton(openMenuBtn);

        const menu = document.getElementById('extra-menu-options-animation');
        const inputs = document.getElementById('top-bar-inputs-animation');
        const width = UILogic.addWidthForExtraMenu();
        const inputsWidth = UILogic.addWidthForTopBarInputs();


        Utility.hideElement(menu);

        const animateHideExtraMenu = function() {
            menu.animate({
                width: [`${width}px`, '0px'],
                opacity: [1, 0.2, 0, 0]
            }, {
                duration: 100
            }).finished.then(() => Utility.hideElement(menu));
            
            Utility.showElement(inputs);
            inputs.animate({
                width: ['0', `${inputsWidth}px`],
                opacity: [0, 0, 0.2, 1]
            }, {
                duration: 100
            });
        },
        animateShowExtraMenu = function() {
            Utility.showElement(menu);
            menu.animate([
                { width: '0px', opacity: 0},
                { width: `${width}px`, opacity: 1 }
            ], {
                duration: 100,
            });

            inputs.animate({
                width: [`${inputsWidth}px`, '0px'],
                opacity: [1, 0.2, 0, 0]
            }, {
                duration: 100
            }).finished.then(() => {
                Utility.hideElement(inputs);
            });
        };

        openMenuBtn.addEventListener('click', () => {
            if(Utility.isHiddenExplicitly(menu)) {
                animateShowExtraMenu();
            } else {
                animateHideExtraMenu();
            }
        }); 
    },

    createContextMenu(meta) {
        const menu = document.createElement('div');
        menu.classList.add('context-menu');
        meta = {options: meta.getOptions(), actions: meta.getActions()};

        for(let i = 0; i < meta.options.length; i++) {
            const optionEl = document.createElement('div');
            optionEl.classList.add('context-option');
            optionEl.textContent = meta.options[i];
            optionEl.onclick = () => {
                meta.actions[i]();
                menu.remove();
            };
            optionEl.oncontextmenu = (e) => {
                e.preventDefault();
                meta.actions[i]();
                menu.remove();
            };
            menu.append(optionEl);
        }
        return menu;
    },

    addContextMenuToElement(element, options=null, actions=null, meta=null) {
        if(options) meta = {
            getOptions: () => options,
            getActions: () => actions
        };
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if(meta.getOptions().length === 0) return;
            const existingContextMenu = document.querySelector('.context-menu');
            if(existingContextMenu) existingContextMenu.remove();

            const menu = UILogic.createContextMenu(meta);
            document.body.append(menu);
            menu.style.top = `${Math.min(window.innerHeight - menu.scrollHeight, e.clientY)}px`;
            menu.style.left = `${Math.min(window.innerWidth - menu.scrollWidth, e.clientX)}px`;
            document.body.append(menu);
            
            const removeMenu = () => {
                if(!menu.matches(':hover')) {
                    menu.remove();
                    document.body.removeEventListener('click', removeMenu);
                    document.body.removeEventListener('contextmenu', removeMenu);
                } 
            }

            document.body.addEventListener('click', removeMenu);
            setTimeout(() => {window.addEventListener('contextmenu', removeMenu);}, 0);
        });
    },

    createReadOnlyText(name, value) {
        const input = document.createElement('input');
        input.readOnly = true;
        input.value = value;
        
        const label = document.createElement('label');
        label.textContent = name.capitalize();

        const textReadOnlyField = document.createElement('div');
        const inputAndLabelContainer = document.createElement('div');
        textReadOnlyField.classList.add('record-additional-field');
        inputAndLabelContainer.classList.add('record-additional-field-content-container');

        inputAndLabelContainer.append(label, input);
        textReadOnlyField.append(inputAndLabelContainer);
        return textReadOnlyField;
    },

    createRecordAdditionalPart(data) {
        const additional = document.createElement('div');
        additional.classList.add('record-additional');

        const textElements = data['text'].map(textField => UILogic.createReadOnlyText(textField.name, textField.value));
        const extraElements = [];
        if(textElements.length % 2 !== 0) {
            extraElements.push(document.createElement('span'));
        }
        const passwordElements = data['password'].map(textField => UILogic.createPasswordButton(textField.name, textField.value, textField.IV));

        additional.append(...textElements, ...passwordElements);
        Utility.hideElement(additional);
        return additional;
    },

    addBackUpLogic() {
        const btn = document.getElementById('backup-btn');
        const downloadBackup = () => {
            btn.removeEventListener('click', downloadBackup);

            const jsonFile = Backup.createJSONFile(LocalPasswordStorage.sliceRecords(0, undefined), 'encrypted_accounts');
            const link = document.createElement('a');
            const url = URL.createObjectURL(jsonFile);

            link.href = url;
            link.download = jsonFile.name;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            btn.addEventListener('click', downloadBackup);
        };
        btn.addEventListener('click', downloadBackup);
    },

    addOpenUnpackFormLogic() {
        const formContainer = document.getElementById('unpack-form-container');
        const btn = document.getElementById('unpack-btn');
        btn.addEventListener('click', () => {
            Utility.showElement(formContainer);
        });
    },

    addEraseLogic() {
        const btn = document.getElementById('erase-btn');
        const yesBtn = document.getElementById('erase-yes');
        const noBtn = document.getElementById('erase-no');
        btn.addEventListener('click', () => {
            Utility.showElement(document.getElementById('erase-confirmation-container'));
        });
        yesBtn.addEventListener('click', () => {
            LocalPasswordStorage.deleteAllRecords();
            UILogic.Status.Page = 1;
            UILogic.Status.Group = 'All';
            UILogic.loadCurrentPage();
            Utility.hideElement(document.getElementById('erase-confirmation-container'));
        });
        noBtn.addEventListener('click', () => {
            Utility.hideElement(document.getElementById('erase-confirmation-container'));
        });
    },

    addExtraOptionsLogic() {
        UILogic.addBackUpLogic();
        UILogic.addOpenExtraMenuLogic();
        UILogic.addOpenUnpackFormLogic();
        UILogic.addEraseLogic();
    },

    addKeyPhraseInputLogic() {
        const input = document.getElementById('key-phrase'),
             hideBtn = document.getElementById('top-key-phrase-container').querySelector('i.fa-eye'),
             inputBlur = document.getElementById('key-phrase-blur'),
             progressBar = document.getElementById('key-phrase-progress-bar');

        const startProgressBarLength = 40;
        const progressBarMaxWidth = document.getElementById('top-key-phrase-container').offsetWidth;
        progressBar.style.width = `${startProgressBarLength}px`;

        const stepPx = Math.floor((progressBarMaxWidth - startProgressBarLength)/32);
        let randSmallInts = new Uint8Array(32);
        window.crypto.getRandomValues(randSmallInts);
        randSmallInts = Array.from(randSmallInts).map(x => x % 4 + 1);

        const sum = Utility.sum(randSmallInts);
        let progressLengths = [];
        
        for(let i = randSmallInts.length - 1; i >= 0; i--) {
            if(i == randSmallInts.length - 1) progressLengths[i] = sum;
            else progressLengths[i] = progressLengths[i+1] - randSmallInts[i+1];
        }

        const focusInput = () => {
            input.focus();
            setTimeout(() => {
                const val = input.value;
                input.value = '';
                input.value = val;
            }, 0);
        };

        hideBtn.addEventListener('mousedown', e => {
            e.preventDefault();
        });
        hideBtn.addEventListener('click', () => {
            hideBtn.classList.toggle('fa-regular');
            hideBtn.classList.toggle('fa-solid');


            if(hideBtn.classList.contains('fa-regular')) {
                input.type = 'password';
                Utility.showElement(inputBlur);
            } else {
                input.type = 'text';
                Utility.hideElement(inputBlur);
            }

            focusInput();
        });

        inputBlur.addEventListener('mousedown', e => e.preventDefault());
        inputBlur.addEventListener('click', focusInput);
        input.addEventListener('input', () => {
            if(input.value !== '') {
                Utility.showElement(progressBar);
                inputBlur.textContent = '••••••••••••••';
                const index = progressLengths.findIndex(x => x > input.value.length);
                progressBar.style.width = `${startProgressBarLength + index*stepPx}px`;
            } else {
                Utility.hideElement(progressBar);
                inputBlur.textContent = 'Key phrase';
            }
        });
    },

    addClearKeyPhraseAfterInactivityLogic() {
        let timeout;

        function resetField() {
            const keyPhraseInput = document.getElementById("key-phrase");
            keyPhraseInput.value = "";
            keyPhraseInput.dispatchEvent(new Event('input'));
        }

        function restartTimer() {
            clearTimeout(timeout); 
            timeout = setTimeout(resetField, 3 * 60 * 1000);
        }

        document.addEventListener("mousemove", restartTimer);
        document.addEventListener("keydown", restartTimer);
        document.addEventListener("click", restartTimer);

        restartTimer();
    }
}; 

const Backup = {
    createJSONFile(object, fileName) {
        const date = new Date();
        const dateStr = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return new File([JSON.stringify(object, null, 2)], `${fileName}_${dateStr}.json`);
    }
};

const ObjectStructure = {
    fieldObject: (fieldName, fieldStructure) => {
        return {fieldName, fieldStructure};
    },

    structureArrayOfObjects: (objectStructure) => {
        return (value) => {
            if(!Array.isArray(value)) return false;
            return value.reduce((acc, obj) => {
                if(!acc) return false;
                return ObjectStructure.checkIfValueContainsStructure(obj, objectStructure);
            }, true);
        };
    },

    checkIfValueContainsStructure(value, structure) {
        if(!structure && typeof(structure) !== 'string' && !Array.isArray(structure) && typeof(structure) !== 'function')
            throw new Error('checkIfValueContainsStructure | structure have to be either string, array or function');
        if(typeof(structure) === 'string') return typeof(value) === structure;
        if(typeof(structure) === 'function') return Boolean(structure(value));
        if(typeof(value) !== 'object') return false;
        return structure.reduce((acc, substructure) => {
            if(!acc) return false;
            return ObjectStructure.checkIfValueContainsStructure(value[substructure.fieldName], substructure.fieldStructure);
        }, true);
    },
};

const UnpackForm = (() => {
    const fieldObject = ObjectStructure.fieldObject;
    const structureArrayOfObjects = ObjectStructure.structureArrayOfObjects;
    const RecordStructure = [
        fieldObject('title', 'string'),
        fieldObject('text', 
            structureArrayOfObjects([fieldObject('name', 'string'), fieldObject('value', 'string')])
        ),
        fieldObject('password', 
            structureArrayOfObjects([
                fieldObject('name', 'string'), 
                fieldObject('value', 'string'), 
                fieldObject('IV', (val) => {
                    if(!structureArrayOfObjects('number')) return false;
                    return val.length === 12;
                })]
            )
        ),
        fieldObject('tags', structureArrayOfObjects('string')),
        fieldObject('groups', structureArrayOfObjects('string'))
    ];

    return {
        addUnpackLogic() {
            UnpackForm.addFileInputLogic();
            UnpackForm.addCloseFormLogic();
            UnpackForm.addSumbitLogic();
        },
    
        resetForm() {
            const form = document.getElementById('unpack-form');
            form.reset();
            UnpackForm.updateFileName();
        },
    
        addCloseFormLogic() {
            const btn = document.getElementById('unpack-form-close-btn');
            const formContainer = document.getElementById('unpack-form-container');
            btn.addEventListener('click', () => {
                Utility.hideElement(formContainer);
                UnpackForm.resetForm();
            });
        },
    
        updateFileName() {
            const file = document.getElementById('backup-file-upload').files[0];
            const fileName = document.getElementById('file-name');
            fileName.textContent = file ? file.name : "No chosen file";
            fileName.classList.remove('error');
            document.getElementById('unpack-submit').disabled = !file;
        },
    
        addFileInputLogic() {
            const input = document.getElementById('backup-file-upload');
            const dropArea = document.getElementById('file-upload-label');
    
            
            input.addEventListener('change', (e) => {
                UnpackForm.updateFileName();
            });
    
            dropArea.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropArea.classList.add("drag-over");
            });
    
            dropArea.addEventListener("dragleave", () => {
                dropArea.classList.remove("drag-over");
            });
    
            dropArea.addEventListener("drop", (e) => {
                e.preventDefault();
                dropArea.classList.remove("drag-over");
    
                if (e.dataTransfer.files.length > 0) {
                    input.files = e.dataTransfer.files; 
                    UnpackForm.updateFileName();
                }
            });
        },
    
        async validateFile(file) {
            if(!file || !file.name.endsWith('.json')) return {valid: false, msg: 'File has to be .json format'};
            const fileReader = new FileReader();
            fileReader.readAsText(file);

            return new Promise((resolve, _) => {
                fileReader.onloadend = () => {
                    fileReader.onloadend = null;
                    const jsonContent = fileReader.result;
                    try {
                        const jsonObject = JSON.parse(jsonContent);
                        if(!Array.isArray(jsonObject)) throw new Error('Not array');
        
                        jsonObject.forEach((record) => {
                            if(!ObjectStructure.checkIfValueContainsStructure(record, RecordStructure)) throw new Error('Array objects has wrong structure');
                        });
                        return resolve({valid: true, records: jsonObject});
                    } catch(e) {;
                        resolve({valid: false, msg: 'File has wrong structure'});
                    };
                };
            });
        },

        collectFormData: () => {
            return {
                unpackMode: document.querySelector('input[name="unpack-mode"]:checked').value,
                mergeMode: document.querySelector('input[name="merge-mode"]:checked').value,
                file: document.getElementById('backup-file-upload').files[0]
            };
        },

        mergeReplaceFullRecord(records) {
            const oldRecords = LocalPasswordStorage.sliceRecords(0, undefined);
            let addedN = 0, updatedN = 0;
            records.forEach(record => {
                const index = oldRecords.findIndex(oldR => oldR.title === record.title);
                if(index === -1) {
                    oldRecords.push(record);
                    addedN += 1;
                } else {
                    oldRecords[index] = record;
                    updatedN += 1;
                } 
            });
            LocalPasswordStorage.deleteAllRecords();
            oldRecords.forEach(r => LocalPasswordStorage.addRecord(r));
            return [addedN, updatedN];
        },

        mergePrefer(oldOrNew, records) {
            const oldRecords = LocalPasswordStorage.sliceRecords(0, undefined);
            let addedN = 0, updatedN = 0;
            records.forEach(record => {
                const index = oldRecords.findIndex(oldR => oldR.title === record.title);
                if(index === -1) {
                    oldRecords.push(record);
                    addedN += 1;
                } else {
                    const baseRecord = oldOrNew === 'old' ? oldRecords[index] : record,
                        sourceRecord =  oldOrNew === 'old' ? record : oldRecords[index]; 
                    const buildingRecord = baseRecord;
                    ['text', 'password'].forEach(fieldsSet => {
                        sourceRecord[fieldsSet].forEach(fieldObj => {
                            const index = buildingRecord[fieldsSet].findIndex(obj => obj.name === fieldObj.name);
                            if(index === -1) buildingRecord[fieldsSet].push(fieldObj);
                        });
                    });
                    oldRecords[index] = buildingRecord;
                    updatedN += 1;
                };
            });
            LocalPasswordStorage.deleteAllRecords();
            oldRecords.forEach(r => LocalPasswordStorage.addRecord(r));
            return [addedN, updatedN];
        },

        mergeNewRecords(records, mode) {
            switch(mode) {
                case 'replace-full-record':  return UnpackForm.mergeReplaceFullRecord(records);
                case 'prefer-old-values':    return UnpackForm.mergePrefer('old', records);   
                case 'prefer-new-values':    return UnpackForm.mergePrefer('new', records);     
            }
            return [0, 0];
        },

        showUnpackReport(isSuccess, addedNumber, updatedNumber, groupsAdded) {
            const background = document.createElement('div');
            background.classList.add('fullscreen-dark-bg');

            const report = document.createElement('div');
            report.classList.add('unpack-report');

            const reportTitle = document.createElement('div');
            reportTitle.classList.add('unpack-report-title');
            reportTitle.textContent = 'Report'

            const reportSubtitle = document.createElement('div');
            reportSubtitle.classList.add('unpack-report-subtitle');
            if(isSuccess) reportSubtitle.classList.add('successfuly');
            else reportSubtitle.classList.add('failed');
            reportSubtitle.textContent = isSuccess ? 'Successfully unpacked' : 'Unpacking failed';

            const reportTable = document.createElement('div');
            reportTable.classList.add('unpack-report-table');

            const spanText = (text) => {
                const span = document.createElement('span');
                span.textContent = text;
                return span;
            };
            reportTable.append(...[
                spanText('Records added'), spanText(addedNumber),
                spanText('Records updated'), spanText(updatedNumber),
                spanText('Groups added'), spanText(groupsAdded)
            ]);

            const closeBtn = document.createElement('button');
            closeBtn.classList.add('unpack-report-close');
            closeBtn.textContent = 'Close';
            closeBtn.addEventListener('click', () => {
                background.remove();
            });

            report.append(reportTitle, reportSubtitle, reportTable, closeBtn);
            background.append(report);
            document.body.appendChild(background);
        },

        showErrorMessage(msg) {
            const message = document.createElement('div');
            message.classList.add('unpack-start-error-msg');
            message.textContent = `❗${msg}❗`;
            const form = document.getElementById('unpack-form');

            const hideMsg = () => {
                message.remove();
                clearTimeout(id);
                form.removeEventListener('change', hideMsg);
            };

            form.addEventListener('change', hideMsg);
            var id = setTimeout(hideMsg, 3000);

            document.getElementById('unpack-bottom-container').append(message);
        },
    
        addSumbitLogic() {
            const btn = document.getElementById('unpack-submit');
            btn.onclick = () => {
                const formData = UnpackForm.collectFormData();
                const submitBtn = document.getElementById('unpack-submit');
                submitBtn.textContent = 'Validation...';
                UnpackForm.validateFile(formData.file).then(valid => {
                    let newRecordsNumber = 0, updatedRecordsNumber = 0, groupsAdded = 0;
                    if(!valid.valid) {
                        submitBtn.textContent = 'Unpack';
                        document.getElementById('file-name').classList.add('error');
                        document.getElementById('unpack-submit').disabled = true;
                        UnpackForm.showErrorMessage(valid.msg);
                        return;
                    } 
                    submitBtn.textContent = 'Unpacking...';

                    const currentGroupList = LocalPasswordStorage.getAllGroups();
                    const newGroupList = [];
                    valid.records.forEach(r => {
                        r.groups.forEach(g => {
                            if(newGroupList.findIndex(x => x === g) === -1 && currentGroupList.findIndex(x => x === g) === -1) {
                                newGroupList.push(g);
                                groupsAdded += 1;
                            }
                        });
                    });
                    newGroupList.forEach(g => LocalPasswordStorage.addGroup(g));

                    switch(formData.unpackMode) {
                        case 'append-all':
                            valid.records.forEach(record => {
                                LocalPasswordStorage.addRecord(record);
                            });
                            newRecordsNumber = valid.records.length;
                            break;
                        case 'merge-on-title':
                            [newRecordsNumber, updatedRecordsNumber] = UnpackForm.mergeNewRecords(valid.records, formData.mergeMode);
                            break;
                    };

                    UILogic.showSidebarGroups();
                    UILogic.loadCurrentPage();
                    submitBtn.textContent = 'Unpack';
                    document.getElementById('unpack-form-close-btn').dispatchEvent(new Event('click'));
                    UnpackForm.showUnpackReport(true, newRecordsNumber, updatedRecordsNumber, groupsAdded);
                });
                return false;
            };
        }
    };
})()

const Encryption = {
    arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer.buffer;
    },

    async encryptAESGCM(str, keyPhrase) {
        const textEncoder = new TextEncoder();
        const phraseEncoded = textEncoder.encode(keyPhrase);
        const passwordEncoded = textEncoder.encode(str);
        const IV = window.crypto.getRandomValues(new Uint8Array(12));
    
        const phraseHash = await window.crypto.subtle.digest('SHA-256', phraseEncoded);
        const publicKey = await window.crypto.subtle.importKey('raw', phraseHash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        const encryptedPassword = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: IV }, publicKey, passwordEncoded);
        const encryptedPasswordBase64 = Encryption.arrayBufferToBase64(encryptedPassword);

        return {
            IV: Array.from(IV),
            encryptedPassword: encryptedPasswordBase64
        };
    },

    async decryptAESGCM(base64, keyPhrase, IV) {
        const textEncoder = new TextEncoder(),
            textDecoder = new TextDecoder(textEncoder.encoding);

        const passwordEncoded = Encryption.base64ToArrayBuffer(base64);

        const phraseEncoded = textEncoder.encode(keyPhrase);
        const phraseHash = await window.crypto.subtle.digest('SHA-256', phraseEncoded);
        const publicKey = await window.crypto.subtle.importKey('raw', phraseHash, { name: 'AES-GCM' }, false, ['decrypt']);
        
        try {
            const decryptedPassword = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: Uint8Array.from(IV) }, publicKey, passwordEncoded);
            const decryptedPasswordUtf8 = textDecoder.decode(decryptedPassword);
            return decryptedPasswordUtf8;
        } catch(e) {
            return null;
        }
    },

    async getHash(str, maxSymbols) {
        const textEncoder = new TextEncoder();
        return Encryption.arrayBufferToBase64(
            await window.crypto.subtle.digest('SHA-256', textEncoder.encode(str))
        ).slice(0, maxSymbols);
    }
};







