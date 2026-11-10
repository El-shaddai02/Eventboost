// Explain: Contact form validation and submission logic.
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var successPanel = document.getElementById('contactSuccess');
    var errorPanel = document.getElementById('contactError');
    var submitBtn = document.getElementById('contactSubmit');
    var submitLabel = submitBtn ? submitBtn.innerHTML : 'Envoyer ma demande';
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    try {
        var params = new URLSearchParams(window.location.search);
        var service = params.get('app_service');
        if (service) {
            var select = form.querySelector('#cf_type');
            if (select) {
                Array.prototype.forEach.call(select.options, function (option) {
                    if (option.value === service) select.value = service;
                });
            }
        }
    } catch (err) {
        /* paramètre ignoré si indisponible */
    }

    function valueOf(id) {
        var el = form.querySelector('#' + id);
        return el ? el.value.trim() : '';
    }

    function setError(name, message) {
        var field = form.querySelector('[data-field="' + name + '"]');
        if (!field) return;
        field.classList.add('has-error');
        var err = field.querySelector('.field-error');
        if (err && message) err.textContent = message;
    }

    function clearErrors() {
        form.querySelectorAll('.field').forEach(function (field) {
            field.classList.remove('has-error');
        });
    }

    function validate() {
        clearErrors();
        var valid = true;

        if (!valueOf('cf_name')) { setError('name', 'Veuillez indiquer votre nom complet.'); valid = false; }
        if (!valueOf('cf_email')) { setError('email', 'Veuillez indiquer votre e-mail.'); valid = false; }
        else if (!emailRe.test(valueOf('cf_email'))) { setError('email', 'Adresse e-mail invalide.'); valid = false; }
        if (!valueOf('cf_phone')) { setError('phone', 'Veuillez indiquer votre téléphone.'); valid = false; }
        if (!valueOf('cf_type')) { setError('type', "Veuillez choisir un type d'événement."); valid = false; }
        if (!valueOf('cf_message')) { setError('message', 'Merci de décrire votre projet.'); valid = false; }

        var consent = form.querySelector('#cf_consent');
        if (consent && !consent.checked) {
            setError('consent', 'Votre consentement est nécessaire pour envoyer votre demande.');
            valid = false;
        }
        return valid;
    }

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
        var eventName = el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date' ? 'change' : 'input';
        el.addEventListener(eventName, function () {
            var field = el.closest('.field');
            if (field) field.classList.remove('has-error');
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (errorPanel) errorPanel.style.display = 'none';

        if (!validate()) {
            var firstError = form.querySelector('.field.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var input = firstError.querySelector('input, select, textarea');
                if (input) input.focus();
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours…';
        }

        var data = {
            name: valueOf('cf_name'),
            email: valueOf('cf_email'),
            phone: valueOf('cf_phone'),
            type: valueOf('cf_type'),
            date: valueOf('cf_date'),
            place: valueOf('cf_place'),
            budget: valueOf('cf_budget'),
            participants: valueOf('cf_participants'),
            subject: valueOf('cf_subject'),
            message: valueOf('cf_message')
        };

        var fields = [
            { label: 'Nom complet', value: data.name, type: 'text' },
            { label: 'E-mail', value: data.email, type: 'email' },
            { label: 'Téléphone', value: data.phone, type: 'tel' },
            { label: "Type d'événement", value: data.type, type: 'text' },
            { label: 'Date souhaitée', value: data.date, type: 'date' },
            { label: "Lieu de l'événement", value: data.place, type: 'text' },
            { label: 'Budget estimé (FCFA)', value: data.budget, type: 'text' },
            { label: 'Nombre de participants', value: data.participants, type: 'number' },
            { label: 'Sujet', value: data.subject, type: 'text' },
            { label: 'Message', value: data.message, type: 'textarea' }
        ];

        window.MessagesSystem.submit(fields, form).then(function (response) {
            if (response && response.success) {
                window.ServerFunction.call('send_confirmation', { email: data.email, name: data.name })
                    .catch(function () { /* la demande reste enregistrée, une nouvelle tentative est possible */ });
                form.style.display = 'none';
                if (successPanel) {
                    successPanel.style.display = 'block';
                    successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                throw new Error((response && response.error) || 'Envoi impossible');
            }
        }).catch(function () {
            if (errorPanel) errorPanel.style.display = 'block';
        }).finally(function () {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitLabel;
            }
        });
    });

    var resetBtn = document.getElementById('contactReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.reset();
            clearErrors();
            if (successPanel) successPanel.style.display = 'none';
            form.style.display = '';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});