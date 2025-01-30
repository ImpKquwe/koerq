(function () {
    // Функция добавления пункта меню
    function addMenuItem() {
        // Проверяем, загружено ли приложение LAMPA
        if (!window.Lampa || !window.Lampa.Menu) {
            console.error('LAMPA API не доступно');
            return;
        }

        // Создаем новый элемент меню
        const menuItem = {
            title: 'Онлайн-кинотеатры', // Текст на кнопке
            icon: 'tv', // CSS класс для иконки (можно использовать FontAwesome или другие иконки)
            page: 'stream_sites_page', // Уникальный идентификатор страницы
            action: function () {
                // Действие при нажатии на кнопку
                console.log('Кнопка "Онлайн-кинотеатры" нажата');
                // Переход на новую страницу
                window.Lampa.Page.go('stream_sites_page');
            }
        };

        // Добавляем элемент в меню
        window.Lampa.Menu.add(menuItem);

        // Регистрируем новую страницу, которую открывает кнопка
        window.Lampa.Page.register('stream_sites_page', {
            title: 'Онлайн-кинотеатры', // Заголовок страницы
            create: function () {
                // Создание контента страницы
                this.sites = [
                    { name: 'Seasonvar', url: 'https://seasonvar.ru' },
                    { name: 'HD-Rezka', url: 'https://hd-rezka.one' }
                ];

                this.content = $('<div>').addClass('stream-sites-page');

                let html = '';
                this.sites.forEach(site => {
                    html += `
                        <div class="menu-item" data-site="${site.name}">
                            <div class="menu-item-icon"><i class="fas fa-film"></i></div>
                            <div class="menu-item-title">${site.name}</div>
                        </div>
                    `;
                });

                this.content.html(html);
            },
            render: function () {
                // Отображение контента страницы
                window.Lampa.Main.body().html(this.content);

                // Обработка выбора сайта
                $('.menu-item').on('hover:enter', (event) => {
                    const siteName = $(event.target).data('site');
                    const site = this.sites.find(s => s.name === siteName);
                    this.loadCatalog(site);
                });
            },
            loadCatalog: function (site) {
                window.Lampa.Activity.loader(true);

                // Пример API-запроса к сайту
                fetch(`${site.url}/api/catalog`) // Замените на реальный URL API
                    .then(response => response.json())
                    .then(data => {
                        window.Lampa.Activity.loader(false);

                        let html = '';
                        data.items.forEach(item => {
                            html += `
                                <div class="card" data-id="${item.id}" data-type="${item.type}">
                                    <img src="${item.poster}" class="card-img">
                                    <div class="card-title">${item.title}</div>
                                </div>
                            `;
                        });

                        window.Lampa.Page.go({
                            title: site.name,
                            html: html,
                            onBack: () => this.render(),
                            onSelect: (element) => {
                                const id = element.data('id');
                                const type = element.data('type');
                                this.showDetails(id, type, site);
                            }
                        });
                    })
                    .catch(error => {
                        window.Lampa.Activity.loader(false);
                        window.Lampa.Noty.show('Ошибка загрузки каталога');
                    });
            },
            showDetails: function (id, type, site) {
                window.Lampa.Activity.loader(true);

                // Пример API-запроса для деталей фильма/сериала
                fetch(`${site.url}/api/details?id=${id}`) // Замените на реальный URL API
                    .then(response => response.json())
                    .then(data => {
                        window.Lampa.Activity.loader(false);

                        let html = `
                            <div class="details">
                                <img src="${data.poster}" class="details-poster">
                                <div class="details-title">${data.title}</div>
                                <div class="details-description">${data.description}</div>
                            </div>
                        `;

                        if (type === 'series') {
                            html += '<div class="seasons">';
                            data.seasons.forEach(season => {
                                html += `<div class="season" data-season="${season.number}">Сезон ${season.number}</div>`;
                            });
                            html += '</div>';
                        }

                        window.Lampa.Page.go({
                            title: data.title,
                            html: html,
                            onBack: () => this.loadCatalog(site),
                            onSelect: (element) => {
                                if (element.hasClass('season')) {
                                    const seasonNumber = element.data('season');
                                    this.showEpisodes(id, seasonNumber, site);
                                } else {
                                    this.playVideo(data.video_url);
                                }
                            }
                        });
                    })
                    .catch(error => {
                        window.Lampa.Activity.loader(false);
                        window.Lampa.Noty.show('Ошибка загрузки информации');
                    });
            },
            showEpisodes: function (id, seasonNumber, site) {
                window.Lampa.Activity.loader(true);

                // Пример API-запроса для списка серий
                fetch(`${site.url}/api/episodes?id=${id}&season=${seasonNumber}`) // Замените на реальный URL API
                    .then(response => response.json())
                    .then(data => {
                        window.Lampa.Activity.loader(false);

                        let html = '';
                        data.episodes.forEach(episode => {
                            html += `
                                <div class="episode" data-url="${episode.url}">
                                    Серия ${episode.number} - ${episode.title}
                                </div>
                            `;
                        });

                        window.Lampa.Page.go({
                            title: `Сезон ${seasonNumber}`,
                            html: html,
                            onBack: () => this.showDetails(id, 'series', site),
                            onSelect: (element) => {
                                const videoUrl = element.data('url');
                                this.playVideo(videoUrl);
                            }
                        });
                    })
                    .catch(error => {
                        window.Lampa.Activity.loader(false);
                        window.Lampa.Noty.show('Ошибка загрузки серий');
                    });
            },
            playVideo: function (videoUrl) {
                window.Lampa.Player.play({
                    title: 'Видео',
                    url: videoUrl
                });
            }
        });
    }

    // Вызываем функцию после загрузки LAMPA
    document.addEventListener('lampa_ready', function () {
        addMenuItem();
    });
})();
