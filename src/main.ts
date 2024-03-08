import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

!async function bootstrap(): Promise<void> {
   const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
   });

   const config = new DocumentBuilder()
       .setTitle('Books test application')
       .setDescription('Documentation REST API')
       .setVersion('1.0.0')
       .addTag('Point Doc')
       .build();
   const document = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('/docs', app, document);

   // Define the CORS options
   const corsOptions = {
      origin: [
         process.env.HOST_HTTP,
      ],
      methods: 'POST,GET',
      credentials: true, // Enable cookies and authentication headers
   };
   app.enableCors(corsOptions);
   app.setGlobalPrefix('api')

   await app.listen(+process.env.PORT);
}();
