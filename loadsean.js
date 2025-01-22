import sys
import xbmc
import xbmcgui
import xbmcplugin

class SeasonVarPlugin:

    def __init__(self):
        self.handle = int(sys.argv[1])
        self.add_menu_item()

    def add_menu_item(self):
        # Добавляем пункт "SeasonVar" в боковое меню
        url = sys.argv[0] + "?action=show_seasonvar"
        li = xbmcgui.ListItem("SeasonVar", iconImage="DefaultFolder.png", thumbnailImage="DefaultFolder.png")
        xbmcplugin.addDirectoryItem(self.handle, url, li, True)

        # Показываем пункт меню
        xbmcplugin.endOfDirectory(self.handle)

    def show_seasonvar(self):
        # Здесь можно добавить код для получения списка фильмов и сериалов
        items = [
            {"title": "Film 1", "url": "plugin://path/to/film1"},
            {"title": "Film 2", "url": "plugin://path/to/film2"},
            {"title": "Series 1", "url": "plugin://path/to/series1"}
        ]

        # Добавляем фильмы и сериалы в список
        for item in items:
            li = xbmcgui.ListItem(item["title"])
            xbmcplugin.addDirectoryItem(self.handle, item["url"], li, False)

        xbmcplugin.endOfDirectory(self.handle)

    def play_video(self, url):
        # Запуск видео при нажатии на фильм
        player = xbmc.Player()
        player.play(url)

if __name__ == "__main__":
    plugin = SeasonVarPlugin()
    action = sys.argv[2] if len(sys.argv) > 2 else None

    if action == "show_seasonvar":
        plugin.show_seasonvar()
    elif action == "play_video":
        plugin.play_video(sys.argv[3])
