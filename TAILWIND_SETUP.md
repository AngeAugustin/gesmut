# Configuration Tailwind CSS

Pour que Tailwind CSS fonctionne correctement :

1. **Redémarrer le serveur de développement** :
   ```bash
   npm start
   ```

2. **Vérifier que les fichiers sont correctement configurés** :
   - `tailwind.config.js` existe et contient la bonne configuration
   - `postcss.config.js` existe
   - `src/index.css` contient les directives `@tailwind`

3. **Si les styles ne s'appliquent pas** :
   - Arrêter le serveur (Ctrl+C)
   - Supprimer le dossier `node_modules/.cache` si il existe
   - Redémarrer avec `npm start`

4. **Vérifier dans le navigateur** :
   - Ouvrir les DevTools (F12)
   - Vérifier que les classes Tailwind sont présentes dans les éléments
   - Vérifier que le fichier CSS généré contient les styles Tailwind

