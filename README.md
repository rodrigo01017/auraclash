# AuraClash ⚡

Juego de batallas de aura por turnos, hecho solo con **HTML, CSS y JavaScript** (sin frameworks ni dependencias).

Elige a uno de cuatro guerreros, entra al campo de batalla y derrota a la CPU usando ataques, técnicas y tu nivel de aura.

## Cómo jugar

Abre `index.html` en el navegador. No necesita instalación ni servidor.

Cada turno eliges una acción:

| Acción | Efecto |
|---|---|
| Atacar | Daño básico (+6 de aura) |
| Cargar aura | Recuperas 25 de aura |
| Defender | El próximo golpe te hace mucho menos daño |
| Técnicas | Tres por luchador, gastan aura y tienen animación propia |

Cada dos turnos tu aura sube de nivel (hasta 5) y tus golpes ganan fuerza. Fuego vence a hielo, hielo a rayo y rayo a fuego; la sombra es neutral. Tu racha de victorias se guarda en el navegador (`localStorage`).

## Luchadores y técnicas

| Luchador | Tipo | Técnicas |
|---|---|---|
| Ignis | Fuego | Explosión (estilo Megumin), Palma de fuerza, Esfera de aura |
| Glacia | Hielo | Baile hipnótico, Onda de energía, Imagen residual |
| Voltar | Rayo | Onda de energía, Palma de fuerza, Imagen residual |
| Umbra | Sombra | Eclipse vampírico, Baile hipnótico, Explosión (estilo Megumin) |

## Estructura

```
index.html            Pantallas: inicio, selección, batalla y resultado
styles.css            Diseño neón, campo de batalla y animaciones
script.js             Datos, lógica de combate, IA de la CPU y efectos
aura-clash-logo.svg   Logo
```

## Añadir contenido

Todo se configura en `script.js`:

- **Personaje nuevo:** añade una entrada en `PERSONAJES` (estadísticas y lista de `ataques`) y su aspecto en `ESTILOS`.
- **Ataque nuevo:** añade una entrada en `ATAQUES` (`nombre`, `coste`, `mult`, `anim`). Opciones extra: `ignoraDefensa`, `robaVida`, `agota` o `apoyo`.
- **Animación nueva:** añade una función en `ANIMS` con el mismo nombre que pongas en `anim`.
- **Nuevo tipo de aura:** añade la relación en `VENTAJAS`.
- **Equilibrio:** ajusta `PROB_CRITICO` y `NIVEL_MAX`.

## Publicar en GitHub Pages

1. Sube los archivos a un repositorio.
2. Ve a **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
4. Espera un minuto y tu juego estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Licencia

MIT. Consulta el archivo `LICENSE`.
