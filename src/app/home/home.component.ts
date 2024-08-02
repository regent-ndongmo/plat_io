import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service/service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  data: any;
  dropdowns: { [key in 'ingredients' | 'appareils' | 'ustensiles']: boolean } = {
    ingredients: false,
    appareils: false,
    ustensiles: false
  };

  ingredientList : any;
  appareilList : any;
  ustensilsList: any
  selected: string = ''

  constructor(private service: ServiceService) { }


  ngOnInit() {
    this.selected = ''
    this.loadData();
    this.getIngredient();
    this.getAppareil()
  }

  toggleDropdown(dropdown: 'ingredients' | 'appareils' | 'ustensiles') {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  loadData() {
    this.service.getData().subscribe(
      data => {
        this.data = data;
        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  getIngredient(){
    // Filtrer les données pour n'avoir qu'un seul élément par nom
    this.service.getData().subscribe(data => {
      this.ingredientList = data.reduce((acc:any, curr:any) => {
        if (!acc.some((item:any) => item.ingredients === curr.ingredients)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      console.log(this.ingredientList)
    })

  }

  getAppareil(){
    // Filtrer les données pour n'avoir qu'un seul élément par nom
    this.service.getData().subscribe(data => {
      this.appareilList = data.reduce((acc:any, curr:any) => {
        if (!acc.some((item:any) => item.appliance === curr.appliance)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      console.log(this.appareilList)
    })

  }

  searchUstensils(ustensil: string){
    console.log(ustensil)
  }
  searchAppareil(appareil: string){
    this.selected = appareil;
    this.service.getData().subscribe(
      data => {
        // Trier les données en mettant les éléments avec 'regent' en premier
        this.data = data.sort((a:any, b:any) => {
          if (a.appliance === appareil) {
            return -1; // a doit être placé avant b
          } else if (b.appliance === appareil) {
            return 1; // b doit être placé avant a
          } else {
            return a.appliance.localeCompare(b.appliance); // Trier le reste par ordre alphabétique
          }
        });
        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

}
