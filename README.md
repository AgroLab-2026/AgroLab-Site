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
- `integrante-1.jpg` … `integrante-7.jpg`: fotos individuais (quadradas, ~400×400 px).

Para trocar uma foto, substitua o arquivo mantendo o mesmo nome. Para incluir nomes, adicione um texto dentro de cada `<li class="face">` na seção `#equipe` do `index.html` e atualize o `alt` da imagem.
