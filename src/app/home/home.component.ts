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
  selected: string = '';
  searchQuery: string = '';
  filteredResults: any[] = [];
  showSuggestions: boolean = false;

  constructor(private service: ServiceService) { }


  ngOnInit() {
    this.searchQuery = '';
    this.selected = ''
    this.loadData();
    this.getIngredients();
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

  getIngredients() {
    this.service.getData().subscribe(
      data => {
        const ingredientsSet = new Set<string>();

        data.forEach((item: any) => {
          item.ingredients.forEach((ingredient: any) => {
            ingredientsSet.add(ingredient.ingredient);
          });
        });

        const uniqueIngredients = Array.from(ingredientsSet);
        console.log("uniqueIngredients", uniqueIngredients);

        // Vous pouvez utiliser uniqueIngredients comme vous le souhaitez
        this.ingredientList = uniqueIngredients; // Par exemple, pour l'afficher dans le template
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
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

  searchIngredient(ingredient: string) {
    console.log(ingredient);
    this.selected = ingredient;
    this.service.getData().subscribe(
      data => {
        this.data = data.sort((a: any, b: any) => {
          const aHasIngredient = a.ingredients.some((ing: any) => ing.ingredient === ingredient);
          const bHasIngredient = b.ingredients.some((ing: any) => ing.ingredient === ingredient);

          if (aHasIngredient && !bHasIngredient) {
            return -1;
          } else if (!aHasIngredient && bHasIngredient) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });

        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
  }

  searchUstensils(ustensil: string) {
    console.log(ustensil);
    this.selected = ustensil;
    this.service.getData().subscribe(
      data => {
        // Trier les données en mettant les éléments avec l'ustensile sélectionné en premier
        this.data = data.sort((a: any, b: any) => {
          const aHasUstensil = a.ustensils.includes(ustensil);
          const bHasUstensil = b.ustensils.includes(ustensil);

          if (aHasUstensil && !bHasUstensil) {
            return -1; // a doit être placé avant b
          } else if (!aHasUstensil && bHasUstensil) {
            return 1; // b doit être placé avant a
          } else {
            // Trier le reste par ordre alphabétique
            return 0;
          }
        });

        console.log(this.data);
      },
      error => {
        console.error('Error loading JSON data', error);
      }
    );
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

  //
  onSearch(event: any) {

    const query = event.target.value.toLowerCase();
    if (query.length >= 3) {
      this.filteredResults = this.data.filter((item: any) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients.some((ing: any) => ing.ingredient.toLowerCase().includes(query))
      );
      // this.showSuggestions = this.filteredResults.length > 0;
      this.showSuggestions = true

      if(!this.filteredResults){
        this.filteredResults = [];
      }
    }
    else{
      this.showSuggestions = false
    }
  }

  selectResult(result: any) {
    this.searchQuery = result.name || result.ingredient || result.description;
    this.selected = result.name
    // console.log("", this.selected)
    console.log(result); // Gérer la sélection de l'utilisateur ici
    this.data = [result];
    this.showSuggestions = false; // Masquer les suggestions après sélection
  }

  onFocus() {
    this.showSuggestions = this.filteredResults.length > 0;
  }

  onBlur() {
    // Ajoutez un petit délai pour permettre à l'événement de clic de se déclencher avant de masquer les suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }


  nativeSearch(){
    this.showSuggestions = !this.showSuggestions;
    console.log(this.searchQuery)
    if (this.searchQuery.length >= 3) {
      this.selected = this.searchQuery
      let results = [];
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i];
        if (item.name.toLowerCase().includes(this.searchQuery) || item.description.toLowerCase().includes(this.searchQuery)) {
          results.push(item);
        } else {
          for (let j = 0; j < item.ingredients.length; j++) {
            const ing = item.ingredients[j];
            if (ing.ingredient.toLowerCase().includes(this.searchQuery)) {
              results.push(item);
              break;
            }
          }
        }
      }
      console.log("result : ", results)
      this.filteredResults = results;
      this.data = results
      this.showSuggestions = true;
      if(!this.filteredResults){
        this.filteredResults = [];
      }
    } else {
      this.showSuggestions = false;
    }
  }

}
