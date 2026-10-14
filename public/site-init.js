(function () {
        document.documentElement.classList.add('js')
        try {
          var t = localStorage.getItem('tzjill-theme-v2')
          if (t !== 'light' && t !== 'dark') t = 'dark'
          document.documentElement.dataset.theme = t
        } catch {
          document.documentElement.dataset.theme = 'dark'
        }
      })()
