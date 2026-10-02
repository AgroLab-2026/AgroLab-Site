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

## Como adicionar as fotos da equipe

Salve cada foto em `assets/team/` com o nome usado no `index.html`:

| Integrante        | Arquivo                            |
| ----------------- | ---------------------------------- |
| Juliana Sandes    | `assets/team/juliana-sandes.jpg`   |
| Guilherme Pagani  | `assets/team/guilherme-pagani.jpg` |
| Thiago Soares     | `assets/team/thiago-soares.jpg`    |

Use fotos em retrato (proporção 4:5, ~800×1000 px). Enquanto a foto não existir, o card mostra as iniciais do integrante. Para incluir alguém novo, copie um bloco `<article class="member">` na seção `#equipe` e ajuste nome, iniciais (`data-initials`), foto e links.
