using ProEventosAPI.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProEventos.Application.Dtos
{
    public class PalestranteDto
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string MiniCurriculo { get; set; }

        public UserUpdateDto User { get; set; }
        public IEnumerable<RedeSocialDto> RedesSociais { get; set; }

        public IEnumerable<EventoDto> Eventos { get; set; }
    }
}
