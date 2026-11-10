// Explain: App entry point with scroll, mobile menu, reveal animations, and devis form logic.
document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-header');
    if (header) {
        var onScroll = function () {
            header.classList.toggle('scrolled', window.scrollY > 20);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    var closeMenu = function () {
        if (menu) menu.classList.remove('open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    };
    if (toggle && menu) {
        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            var isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });
        document.addEventListener('click', function (event) {
            if (!menu.classList.contains('open')) return;
            if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
        });
    }

    var current = window.location.pathname.split('/').pop() || 'index.html';
    if (current === 'index-2.html') current = 'index.html';
    document.querySelectorAll('[data-nav]').forEach(function (link) {
        if (link.getAttribute('data-nav') === current) link.classList.add('active');
    });

    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(function (el) { observer.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        }
    }

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    var devisModal = document.getElementById('devisModal');
    if (devisModal) {
        var devisForm = document.getElementById('devisForm');
        var devisFormWrap = document.getElementById('devisFormWrap');
        var devisSuccess = document.getElementById('devisSuccess');
        var devisError = document.getElementById('devisError');
        var devisClose = document.getElementById('devisClose');
        var devisRestart = document.getElementById('devisRestart');
        var devisService = document.getElementById('devisService');
        var devisLastFocus = null;
        var devisEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        function devisOpen(service) {
            devisLastFocus = document.activeElement;
            if (service && devisService) {
                var found = false;
                Array.prototype.forEach.call(devisService.options, function (option) {
                    if (option.value === service) { found = true; }
                });
                if (!found) {
                    var extra = document.createElement('option');
                    extra.value = service;
                    extra.textContent = service;
                    devisService.appendChild(extra);
                }
                devisService.value = service;
            }
            if (devisError) { devisError.style.display = 'none'; }
            if (devisSuccess) { devisSuccess.style.display = 'none'; }
            if (devisFormWrap) { devisFormWrap.style.display = ''; }
            if (devisForm) { devisForm.style.display = ''; }
            devisModal.classList.add('is-open');
            devisModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('no-scroll');
            var first = document.getElementById('devisName');
            if (first) { setTimeout(function () { first.focus(); }, 60); }
        }

        function devisCloseFn() {
            devisModal.classList.remove('is-open');
            devisModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
            if (devisLastFocus && typeof devisLastFocus.focus === 'function') { devisLastFocus.focus(); }
        }

        document.querySelectorAll('[data-devis-open]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                devisOpen(btn.getAttribute('data-devis-service') || '');
            });
        });

        if (devisClose) { devisClose.addEventListener('click', devisCloseFn); }
        devisModal.addEventListener('click', function (event) {
            if (event.target === devisModal) { devisCloseFn(); }
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && devisModal.classList.contains('is-open')) { devisCloseFn(); }
        });

        function devisValue(id) {
            var el = document.getElementById(id);
            return el ? el.value.trim() : '';
        }

        function devisSetError(name, message) {
            var field = devisForm.querySelector('[data-dfield="' + name + '"]');
            if (!field) { return; }
            field.classList.add('has-error');
            var err = field.querySelector('.field-error');
            if (err && message) { err.textContent = message; }
        }

        function devisClearErrors() {
            devisForm.querySelectorAll('.field').forEach(function (field) {
                field.classList.remove('has-error');
            });
        }

        if (devisForm) {
            devisForm.querySelectorAll('input, select, textarea').forEach(function (el) {
                var evt = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(evt, function () {
                    var field = el.closest('.field');
                    if (field) { field.classList.remove('has-error'); }
                });
            });

            devisForm.addEventListener('submit', function (event) {
                event.preventDefault();
                if (devisError) { devisError.style.display = 'none'; }
                devisClearErrors();

                var ok = true;
                if (!devisValue('devisName')) { devisSetError('name', 'Veuillez indiquer votre nom complet.'); ok = false; }
                if (!devisValue('devisPhone')) { devisSetError('phone', 'Veuillez indiquer votre numéro WhatsApp.'); ok = false; }
                if (!devisValue('devisEmail')) { devisSetError('email', 'Veuillez indiquer votre e-mail.'); ok = false; }
                else if (!devisEmailRe.test(devisValue('devisEmail'))) { devisSetError('email', 'Adresse e-mail invalide.'); ok = false; }
                if (!devisValue('devisService')) { devisSetError('service', 'Veuillez choisir un service.'); ok = false; }
                if (!devisValue('devisMessage')) { devisSetError('message', 'Merci d\'écrire votre message.'); ok = false; }

                if (!ok) {
                    if (devisError) { devisError.style.display = 'block'; }
                    var firstError = devisForm.querySelector('.field.has-error');
                    if (firstError) {
                        var input = firstError.querySelector('input, select, textarea');
                        if (input) { input.focus(); }
                    }
                    return;
                }

                var payload = {
                    name: devisValue('devisName'),
                    phone: devisValue('devisPhone'),
                    email: devisValue('devisEmail'),
                    service: devisValue('devisService'),
                    message: devisValue('devisMessage')
                };

                var devisSubmit = document.getElementById('devisSubmit');
                var devisSubmitLabel = devisSubmit ? devisSubmit.innerHTML : 'Envoyer ma demande';
                if (devisSubmit) {
                    devisSubmit.disabled = true;
                    devisSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours…';
                }

                var fields = [
                    { label: 'Nom complet', value: payload.name, type: 'text' },
                    { label: 'Téléphone WhatsApp', value: payload.phone, type: 'tel' },
                    { label: 'E-mail', value: payload.email, type: 'email' },
                    { label: 'Service concerné', value: payload.service, type: 'text' },
                    { label: 'Message', value: payload.message, type: 'textarea' }
                ];

                window.MessagesSystem.submit(fields, devisForm).then(function (response) {
                    if (!response || !response.success) {
                        throw new Error((response && response.error) || 'Envoi impossible');
                    }
                    window.ServerFunction.call('send_devis_request', payload).catch(function () {
                        /* la demande reste enregistrée, une nouvelle tentative est possible */
                    });
                    window.ServerFunction.call('send_confirmation', { email: payload.email, name: payload.name }).catch(function () {
                        /* la demande reste enregistrée, une nouvelle tentative est possible */
                    });
                    if (devisFormWrap) { devisFormWrap.style.display = 'none'; }
                    if (devisSuccess) { devisSuccess.style.display = 'block'; }
                }).catch(function () {
                    if (devisError) { devisError.style.display = 'block'; }
                }).finally(function () {
                    if (devisSubmit) {
                        devisSubmit.disabled = false;
                        devisSubmit.innerHTML = devisSubmitLabel;
                    }
                });
            });
        }

        if (devisRestart) {
            devisRestart.addEventListener('click', function () {
                if (devisForm) { devisForm.reset(); }
                devisClearErrors();
                if (devisSuccess) { devisSuccess.style.display = 'none'; }
                if (devisFormWrap) { devisFormWrap.style.display = ''; }
                var nameInput = document.getElementById('devisName');
                if (nameInput) { nameInput.focus(); }
            });
        }
    }
});