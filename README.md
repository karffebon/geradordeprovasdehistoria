# Gerador de Provas de História — IFSUL

Webapp estático para Chrome/Chromebook, desenvolvido para geração de avaliações de História da EMEF Universitário — Lajeado/RS a partir de questões de provas do IFSUL.

## Recursos

- Geração de 1 a 3 provas, incluindo modo por trimestre.
- Distribuição configurável por Tier 1 (fácil), Tier 2 (médio) e Tier 3 (difícil).
- Sem repetição de questões entre as provas geradas.
- Reroll de questões selecionadas mantendo o mesmo tier.
- Exportação de provas e gabaritos usando Imprimir → Salvar como PDF.
- Exportação da seleção em JSON e importação de banco JSON.
- Banco inicial com 31 questões de História do IFSUL, oriundas de provas de 2017, 2018, 2023 e 2024.

## Banco inicial

Distribuição atual: 13 fáceis, 9 médias e 9 difíceis. Isso permite testar 3 provas de 10 questões no padrão 4/3/3 sem repetir questões entre os trimestres.

As questões de 2024 incluídas no banco possuem gabarito oficial marcado nos metadados. Questões cuja resposta foi conferida pelo conteúdo estão identificadas como `content_checked`.

## Publicação

O workflow em `.github/workflows/pages.yml` publica o conteúdo da branch `main` no GitHub Pages.
