
const cepInput = document.getElementById('cep');
const enderecoDiv = document.getElementById('endereco');
const previsaoInput = document.getElementById('previsao');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');

cepInput.addEventListener('input', async () => {
  const cep = cepInput.value.replace(/[^0-9]/g, '');
  const cepInput = document.getElementById('cep');

  

  if (cep.length === 8) {
    await buscarEnderecoPrevisao(); // Chama a função para buscar dados
  } else {
    cepInput.placeholder = 'Insira o CEP';
   
  }
});
 // Adiciona o evento click ao input do CEP
 cepInput.addEventListener('click', () => {
  cepInput.value = ''; // Limpa o valor do input
});
// Adiciona o evento click ao input do CEP


async function buscarEnderecoPrevisao() {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  previsaoInput.value = ''; // Limpa o input da previsão
  latitudeInput.value = ''; // Limpa o input da latitude
  longitudeInput.value = ''; // Limpa o input da longitude
  
  if (cep.length !== 8) {
    cepInput.value = ' CEP INVALIDO!';
    return;
  }

  try {
    const enderecoResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const enderecoData = await enderecoResponse.json();

    if (enderecoData.erro) {
      cepInput.value = 'CEP não encontrado.';
      cepInput.placeholder = 'Insira o CEP';
      return;
    }

    const nomeRua = enderecoData.logradouro.split(' ')[1];
    const nome = enderecoData.logradouro.split(' ')[2];

    enderecoDiv.innerHTML = `<span class="nomeRua">${nomeRua}</span> <span class="nome">${nome}</span> <span class="bairro">${enderecoData.bairro}</span><span class="localidade"> ${enderecoData.localidade}</span><span class="uf">  - ${enderecoData.uf}</span>`;

    const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${enderecoData.localidade},${enderecoData.uf}`);
    const locationData = await locationResponse.json();

    if (locationData.length > 0) {
      const latitude = locationData[0].lat;
      const longitude = locationData[0].lon;

      latitudeInput.value = latitude;
      longitudeInput.value = longitude;

      const previsaoResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=America%2FSao_Paulo`);
      const previsaoData = await previsaoResponse.json();

      const proximaHoraTemperatura = previsaoData.hourly.temperature_2m[0];

      previsaoInput.value = `${enderecoData.localidade} - ${enderecoData.uf}: Previsão de tempo de acordo com a região : ${proximaHoraTemperatura}°C`; 
    } else {
      previsaoInput.value = 'Erro ao obter localização.';
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    enderecoDiv.innerHTML = 'Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.';
  }
}
