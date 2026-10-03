# AgroLab-Site

Landing page do **AgroLab**, projeto de Iniciação Científica que une **Hardware, Inteligência Artificial e Game** numa estufa inteligente e gamificada para mostrar, na prática, como a tecnologia pode apoiar a agricultura familiar.

Site estático: basta abrir `index.html` no navegador (ou publicar via GitHub Pages).

## Estrutura

```
index.html          conteúdo da página (seções na mesma ordem do pitch)
style.css           identidade visual (paleta e tipografia dos slides)
index.js            menu, animações, vídeos sob demanda e simulação do hero
assets/
  Logo.png
  wave-*.mp4        ondas animadas do hero
  media/            fotos, vídeos e ícones extraídos da apresentação
  team/             fotos da equipe
```

## Fotos da equipe

Ficam em `assets/team/`:

- `equipe.jpg`: foto do time reunido com a estufa;
- uma foto individual por integrante (quadrada, ~400×400 px), nomeada com o nome da pessoa:
  `guilherme-pagani.jpg`, `isabela-diaz.jpg`, `joao-goncalves.jpg`, `juliana-sandes.jpg`,
  `marcela-marques.jpg`, `maria-eloisa-da-silva.jpg`, `siraj-youssef.jpg`.

Para trocar uma foto, substitua o arquivo mantendo o mesmo nome. Para incluir alguém, copie um bloco `<li class="face">` na seção `#equipe` do `index.html` e ajuste a foto, o `alt` e o nome.
