"use strict";

/**
 * Logic
 *  imię, nazwisko, e-mail, login, hasło, rola, status (aktywny/nieaktywny)
 */

(function () {

    var App = {

        storage: localStorage,

        getAllUsers: function (item) {
            var users = this.storage.getItem(item);
            return JSON.parse(users);
        },

        getUserByEmail: function (email) {
            var users = this.getAllUsers('users');
            var user = false;

            for (var i = 0; i < users.length; i++) {
                var u = users[i];
                if (u.email === email) {
                    user = u;
                }
            }

            return user;
        },

        addNewUser: function (key, value) {
            var users = this.getAllUsers(key);
            var check = false;
            var data = [];

            if (users && users.length > 0) {
                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    if (user.email == value.email) {
                        check = true;
                    }
                }
                if (!check) {
                    users.push(value);
                    this.saveToStorage(key, users);
                }
            } else {
                data.push(value);
                this.saveToStorage(key, data);
            }
        },

        saveToStorage: function (key, value) {
            this.storage.setItem(key, JSON.stringify(value));
        },

        removeUser: function (email) {
            var users = this.getAllUsers('users');
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.email == email && user.status == "active") {
                    user.status = "inactive";
                    this.saveToStorage('users', users);
                }
            }
        }

    };

    /**
     * DOM
     */

    $(document).ready(function () {

        /********** Show ************/

        function addUserToList(user) {
            $(".no-users").remove();
            $('#mytable tr:last').after('<tr></tr>');

            for (var val in user) {
                if (val !== 'password' && val !== 'login') {
                    $('#mytable tr:last').append($('<td>').text(user[val]));
                }
            }
            var button = $('<button>').attr('data-email', user['email']).attr('data-toggle', 'modal').attr('data-target', '#edit');
            $('#mytable tr:last').append($('<td>').append(button.text("Edit").addClass('button-edit')));

            var buttonDel = $('<button>').attr('data-email', user['email']).attr('data-toggle', 'modal').attr('data-target', '#delete');
            $('#mytable tr:last').append($('<td>').append(buttonDel.text("Delete").addClass('button-delete')));
        }

        function showUsers(users) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.status === "active") {
                    addUserToList(user);
                }
            }
        }

        var usersFromMemory = App.getAllUsers('users');
        if (usersFromMemory && Object.keys(usersFromMemory).length >= 0) {
            $(".no-users").remove();
            showUsers(usersFromMemory);
        } else {
            $(".table-responsive").append($("<div>").addClass("no-users").append($("<p>").text("no users in memory")));
        }

        $(".show-users").on('click', function () {
            var testUsers = App.getAllUsers('testUsers');
        });


        /********** Add ************/

        $("#add-users").on('submit', function (event) {
            var user = {};
            var firstName = $("#firstName").val();
            var lastName = $("#lastName").val();
            var email = $("#email").val();
            var login = $("#login").val();
            var password = $("#password").val();
            var role = $("#role");
            var status = $("#status");

            user.firstName = (firstName) ? firstName : 'User';
            user.lastName = (lastName) ? lastName : 'Guest';
            user.email = (email) ? email : false;
            user.login = (login) ? login : 'user';
            user.password = (password) ? password : 'guest123';
            user.role = (role.is(':checked')) ? "admin" : "user";
            user.status = (status.is(':checked')) ? "active" : "inactive";

            if (user.email) {
                App.addNewUser('users', user);
            }

            $("#add-users").trigger('reset');

            addUserToList(user);

            event.preventDefault();
        });


        /********** Edit ************/

        $('.button-edit').on('click', function () {
            var email = this.getAttribute('data-email');
            var user = App.getUserByEmail(email);
            var editForm = $("#edit");

            editForm.find('#edit-firstName').val(user.firstName);
            editForm.find('#edit-lastName').val(user.lastName);
            editForm.find('#edit-email').val(user.email);
            editForm.find('#edit-role').prop("checked", user.role === "admin");
            editForm.find('#edit-status').prop("checked", user.status === "active");
        });

        $("#edit-users").on('submit', function (event) {
            var user = {};
            user.firstName = $("#edit-firstName").val();
            user.lastName = $("#edit-lastName").val();
            user.email = $("#edit-email").val();
            user.role = ($("#edit-role").is(':checked')) ? "admin" : "user";
            user.status = ($("#edit-status").is(':checked')) ? "active" : "inactive";

            var users = App.getAllUsers('users');
            for (var i = 0; i < users.length; i++) {
                var u = users[i];
                if (u.email === user.email) {
                    u.firstName = user.firstName;
                    u.lastName = user.lastName;
                    u.role = user.role;
                    u.status = user.status;
                    App.saveToStorage('users', users);
                }
            }

            // @TODO
            // Insert changes

            $("#edit-users").trigger('reset');
            $('#edit').modal('toggle');

            event.preventDefault();
        });

        /********** Delete ************/

        $('.button-delete').on('click', function () {
            var email = this.getAttribute('data-email');
            $("#delete").find('.button-delete').attr('data-email', email);
        });

        $('.delete').on('click', function () {
            var email = this.getAttribute('data-email');
            App.removeUser(email);

            $('#delete').modal('toggle');

            var btn = $("#mytable").find(".button-delete[data-email='" + email + "']");
            btn.closest("tr").css("display", "none");
        });

    });

})();

