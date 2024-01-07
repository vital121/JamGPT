//Beispiel: //https://github.com/jide/gpt-video
//https://www.youtube.com/watch?v=Bf1zaKUMKeQ&t=982s

#0//Project Setup - Vorbereitung Erst-Installation:
  
    npx create-next-app@latest --ts --tailwind --eslint
 
 - src/ directory = Yes
 - App Router = Yes
 - import alias = NO


#1//SDK AI by Vercel//Acces to OpenAI Functoinalitys///Silence-Aware-Recorder for Audio//Media-Recorder for Video//Merge-Images for Image-Merging//
   
    npm install ai openai silence-aware-recorder @wmik/use-media-recorder merge-images

#2//To get environment variables: able to access anywhere with "process.env.OPENAI_API_KEY" in api/speechtotext/route.ts => create ".env.local"-file in root directory with "OPENAI_API_KEY=YOUR_API_KEY"

#End//Building for Presentation

    npm run build