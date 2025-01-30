Lampa.Plugin.add('stream_sites', {
    title: 'Онлайн-кинотеатры',
    version: '1.0.0',
    description: 'Плагин для просмотра фильмов и сериалов с сайтов seasonvar.ru и hd-rezka.one.',
    author: 'Ваше имя',
    sites: [
        { name: 'Seasonvar', url: 'https://seasonvar.ru' },
        { name: 'HD-Rezka', url: 'https://hd-rezka.one' }
    ],

    init: function () {
        this.addMenu();
    },

    addMenu: function () {
        Lampa.Menu.add('stream_sites', {
            title: 'Онлайн-кинотеатры',
            icon: 'tv',
            page: () => {
                this.showSites();
            }
        });
    },

    showSites: function () {
        let html = '';

        this.sites.forEach(site => {
            html += `
                <div class="menu-item" data-site="${site.name}">
                    <div class="menu-item-icon"><i class="fas fa-film"></i></div>
                    <div class="menu-item-title">${site.name}</div>
                </div>
            `;
        });

        Lampa.Page.go({
            title: 'Онлайн-кинотеатры',
            html: html,
            onBack: () => Lampa.Menu.show(),
            onSelect: (element) => {
                const siteName = element.data('site');
                const site = this.sites.find(s => s.name === siteName);
                this.loadCatalog(site);
            }
        });
    },

    loadCatalog: function (site) {
        Lampa.Activity.loader(true);

        fetch(`${site.url}/api/catalog`) // Пример URL для загрузки каталога
            .then(response => response.json())
            .then(data => {
                Lampa.Activity.loader(false);

                let html = '';
                data.items.forEach(item => {
                    html += `
                        <div class="card" data-id="${item.id}" data-type="${item.type}">
                            <img src="${item.poster}" class="card-img">
                            <div class="card-title">${item.title}</div>
                        </div>
                    `;
                });

                Lampa.Page.go({
                    title: site.name,
                    html: html,
                    onBack: () => this.showSites(),
                    onSelect: (element) => {
                        const id = element.data('id');
                        const type = element.data('type');
                        this.showDetails(id, type, site);
                    }
                });
            })
            .catch(error => {
                Lampa.Activity.loader(false);
                Lampa.Noty.show('Ошибка загрузки каталога');
            });
    },

    showDetails: function (id, type, site) {
        Lampa.Activity.loader(true);

        fetch(`${site.url}/api/details?id=${id}`) // Пример URL для загрузки деталей
            .then(response => response.json())
            .then(data => {
                Lampa.Activity.loader(false);

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

                Lampa.Page.go({
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
                Lampa.Activity.loader(false);
                Lampa.Noty.show('Ошибка загрузки информации');
            });
    },

    showEpisodes: function (id, seasonNumber, site) {
        Lampa.Activity.loader(true);

        fetch(`${site.url}/api/episodes?id=${id}&season=${seasonNumber}`)
            .then(response => response.json())
            .then(data => {
                Lampa.Activity.loader(false);

                let html = '';
                data.episodes.forEach(episode => {
                    html += `
                        <div class="episode" data-url="${episode.url}">
                            Серия ${episode.number} - ${episode.title}
                        </div>
                    `;
                });

                Lampa.Page.go({
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
                Lampa.Activity.loader(false);
                Lampa.Noty.show('Ошибка загрузки серий');
            });
    },

    playVideo: function (videoUrl) {
        Lampa.Player.play({
            title: 'Видео',
            url: videoUrl
        });
    }
});
