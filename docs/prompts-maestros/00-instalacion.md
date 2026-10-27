# Instalar las 3 skills en un repositorio nuevo

Se corre en la raíz del repositorio nuevo, con Node 22 o más reciente. Las skills quedan en `.claude/skills/` del proyecto. Hay que hacerles commit para que Claude Code en la web las tenga en cada sesión.

```bash
# 1 · Hyperframes (HeyGen): videos a medida en HTML + GSAP
npx -y skills add heygen-com/hyperframes -a claude-code -s '*' -y --copy

# 2 · Remotion: plantillas, series y videos con datos (React)
npx -y skills add remotion-dev/skills -a claude-code -s '*' -y --copy

# 3 · Brag: videos de lanzamiento cortos
npx -y skills add latent-spaces/brag -a claude-code -s '*' -y --copy

# guardar en el repo
git add .claude skills-lock.json
git commit -m "Instalar skills: Hyperframes, Remotion y Brag"
git push
```

- `-a claude-code` instala para Claude Code, `-s '*'` instala todas las skills del paquete, `-y` no hace preguntas y `--copy` copia los archivos en vez de crear enlaces, que es lo que funciona en la nube.
- Para actualizarlas después: `npx -y skills update -p -y`.
- Programas que usan los videos: ffmpeg, Python 3 (`pip install pillow numpy opencv-python-headless`) y, para el render de Hyperframes, `npx hyperframes browser ensure`.
- Las llaves de servicios, por ejemplo la de Higgsfield, van en `.env` y nunca se suben. Agrega `.env` al `.gitignore`.
