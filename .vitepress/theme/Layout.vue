<script setup>
import {useData} from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const {Layout} = DefaultTheme
const {page} = useData()
</script>

<template>
  <Layout>
    <!-- Override the not-found slot with our custom 404 content -->
    <template #not-found>
      <div class="custom-404">
        <div class="container">
          <h1>404</h1>
          <div class="divider"></div>
          <p class="message">Pagina niet gevonden</p>
          <p class="description">De pagina die u zoekt bestaat niet of is verplaatst.</p>
          <a href="/" class="action">Terug naar home</a>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style>
.custom-404 {
  padding: 64px 24px;
  text-align: center;
}

.custom-404 .container {
  margin: 0 auto;
  max-width: 512px;
}

.custom-404 h1 {
  font-size: 64px;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-brand-1);
}

.custom-404 .divider {
  margin: 24px auto;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.custom-404 .message {
  font-size: 20px;
  font-weight: 500;
}

.custom-404 .description {
  margin: 24px 0 32px;
  color: var(--vp-c-text-2);
}

.custom-404 .action {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--vp-c-brand-1);
  color: white;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.custom-404 .action:hover {
  background-color: var(--vp-c-brand-2);
}
</style>