async function getAvailableWidgets(configFilePath: string){
  const fileExtension = configFilePath.split('.').pop();

  if (fileExtension !== 'json') {
    throw new Error('Unsupported file format. Please provide a JSON configuration file.');
  }
  
  const file = Bun.file(configFilePath);
  if (!file.exists()) {
    throw new Error('Configuration file not found. Please provide a valid path.');
  }

  const contents = await file.json();
  console.log('File contents:', contents);
}


getAvailableWidgets('widgetsTest.json')

